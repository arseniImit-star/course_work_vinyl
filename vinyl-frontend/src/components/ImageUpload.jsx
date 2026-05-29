import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api/api';

function ImageUpload({ vinylId, onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);

        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);

        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await api.post(`/vinyls/${vinylId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onUploadComplete) onUploadComplete();
            alert('✅ Фото успешно загружены!');
        } catch (error) {
            console.error("Upload error:", error);
            alert('❌ Ошибка при загрузке фото');
        } finally {
            setUploading(false);
        }
    }, [vinylId, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        }
    });

    return (
        <div {...getRootProps()} style={dropzoneStyle}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>📸 Отпустите файлы здесь...</p>
            ) : (
                <p>📸 Перетащите фото пластинки (лицевая сторона, оборот, вкладка) или нажмите для выбора</p>
            )}
            {uploading && <p>⏳ Загрузка...</p>}
            {previews.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {previews.map((preview, index) => (
                        <img
                            key={index}
                            src={preview}
                            alt="preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const dropzoneStyle = {
    border: '2px dashed #ff385c',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: '15px',
    background: '#fef2f2',
    transition: 'all 0.3s'
};

export default ImageUpload;