import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import { CommonButton } from "root/shared/components/CommonButton";
import { CommonField } from "root/shared/components/CommonField";
import { Badge, useUploadBadgeMutation } from "../../globalEventsApi";
import { BADGE_IMAGE_MAX_SIZE, BADGE_IMAGE_TYPES, BADGE_NAME_MAX_LENGTH } from "../../globalEventLimits";
import './styles.scss';

const errorStatus = (error: unknown) =>
    typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;

// a tile among the badges of the picker: the administrator chooses a picture, names it and uploads it as a new badge;
// a badge never changes after that, a new picture is a new badge
const BadgeUpload = ({ onUploaded }: BadgeUploadProps) => {
    const { t } = useTranslation();
    const [uploadBadge, uploadResult] = useUploadBadgeMutation();
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState("");
    const [uploadError, setUploadError] = useState<string | null>(null);
    // object url keeps the file in memory until it is revoked; an SVG inside img can't run its scripts
    const previewUrl = useMemo(() => image ? URL.createObjectURL(image) : undefined, [image]);

    useEffect(() => () => {
        if(previewUrl)
            URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const imageProblem = !image ? null
        : !BADGE_IMAGE_TYPES.includes(image.type) ? t("The badge should be SVG, PNG or WebP")
        : image.size > BADGE_IMAGE_MAX_SIZE ? t("The badge should be up to {{size}} KB", { size: BADGE_IMAGE_MAX_SIZE / 1024 })
        : null;
    const canUpload = !!image && !imageProblem && !!name.trim() && !uploadResult.isLoading;

    const upload = async () => {
        if(!image) {
            return;
        }

        setUploadError(null);
        const data = new FormData();
        data.append("name", name.trim());
        data.append("image", image);
        try {
            const { badge } = await uploadBadge({ data }).unwrap();
            setImage(null);
            setName("");
            onUploaded(badge);
        } catch (error) {
            setUploadError(errorStatus(error) === 400
                ? t("The file doesn't fit a badge: an SVG without scripts and outer links, a PNG or a WebP")
                : t("Couldn't upload the badge, try again"));
        }
    };

    return(
        <div className="badge-upload">
            <label className="badge-upload__image">
                {
                    previewUrl ?
                    <img src={previewUrl} className="badge-upload__preview" alt="" />
                    :
                    <>
                        <AddPhotoAlternate className="badge-upload__icon" />
                        {t("Choose a picture")}
                    </>
                }
                <input
                type="file"
                accept={BADGE_IMAGE_TYPES.join(",")}
                className="badge-upload__input"
                onChange={e => {
                    setUploadError(null);
                    setImage(e.target.files?.[0] ?? null);
                    // the same file can be chosen again after a refusal
                    e.target.value = "";
                }} />
            </label>
            <span className={`badge-upload__hint ${imageProblem ? "badge-upload__error" : ""}`}>
                {imageProblem ?? t("A new badge: SVG, PNG or WebP up to {{size}} KB", { size: BADGE_IMAGE_MAX_SIZE / 1024 })}
            </span>
            <CommonField
            placeholder={t("Name")}
            value={name}
            maxLength={BADGE_NAME_MAX_LENGTH}
            className="badge-upload__name"
            onChange={e => setName(e.target.value)} />
            <div className="badge-upload__actions">
                {uploadResult.isLoading && <CircularProgress size={24} color="primary" />}
                <CommonButton color="success" disabled={!canUpload} onClick={upload}>{t("Upload the badge")}</CommonButton>
            </div>
            {uploadError && <span className="badge-upload__error">{uploadError}</span>}
        </div>
    );
};

type BadgeUploadProps = {
    onUploaded: (badge: Badge) => void
}

export { BadgeUpload }
