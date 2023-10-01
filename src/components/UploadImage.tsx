import { Upload, UploadProps } from "antd";
import React, { useState } from "react";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";

type Props = {
  loading?: boolean;
  onChange?: UploadProps['onChange'];
  onUpload?: () => void;
  imageUrl?: string;
};

const UploadImage: React.FC<Props> = ({
  loading,
  imageUrl,
  onUpload,
  onChange,
  ...props
}) => {
  const [previewImage, setPreviewImage] = useState("");

  const beforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setPreviewImage(reader.result as string);
  };

  const customRequest = () => {

  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const imageDisplay = (
    <img
      src={previewImage || imageUrl}
      alt="image-preview"
      style={{ width: "100%" }}
    />
  );

  return (
    <Upload
      accept="image/*"
      listType="picture-card"
      showUploadList={false}
      onChange={onChange}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      {...props}
    >
      {previewImage || imageUrl ? imageDisplay : uploadButton}
    </Upload>
  );
};

export default UploadImage;
