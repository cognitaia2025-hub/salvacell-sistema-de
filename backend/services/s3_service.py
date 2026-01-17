import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError
from config import settings
from typing import Optional, BinaryIO
import logging

logger = logging.getLogger(__name__)


class S3Service:
    """Service for handling S3 operations"""
    
    def __init__(self):
        """Initialize S3 client"""
        self._client = None
        self._is_configured = self._check_configuration()
    
    def _check_configuration(self) -> bool:
        """Check if S3 is properly configured"""
        return bool(
            settings.S3_BUCKET and
            settings.S3_ACCESS_KEY and
            settings.S3_SECRET_KEY
        )
    
    @property
    def client(self):
        """Lazy initialization of S3 client"""
        if not self._is_configured:
            raise ValueError("S3 is not properly configured. Check S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY settings.")
        
        if self._client is None:
            self._client = boto3.client(
                's3',
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.S3_REGION
            )
        return self._client
    
    def upload_file(self, file_obj: BinaryIO, key: str, content_type: str = None) -> str:
        """
        Upload a file to S3
        
        Args:
            file_obj: File object to upload
            key: S3 object key (path)
            content_type: MIME type of the file
        
        Returns:
            S3 URL of the uploaded file
        
        Raises:
            Exception: If upload fails
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.client.upload_fileobj(
                file_obj,
                settings.S3_BUCKET,
                key,
                ExtraArgs=extra_args
            )
            
            # Generate public URL
            url = f"https://{settings.S3_BUCKET}.s3.{settings.S3_REGION}.amazonaws.com/{key}"
            return url
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise Exception("AWS credentials not configured")
        except PartialCredentialsError:
            logger.error("Incomplete AWS credentials")
            raise Exception("Incomplete AWS credentials")
        except ClientError as e:
            logger.error(f"S3 upload error: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    def delete_file(self, key: str) -> bool:
        """
        Delete a file from S3
        
        Args:
            key: S3 object key (path)
        
        Returns:
            True if successful
        """
        try:
            self.client.delete_object(Bucket=settings.S3_BUCKET, Key=key)
            return True
        except ClientError as e:
            logger.error(f"S3 delete error: {e}")
            return False
    
    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generate a presigned URL for uploading to S3
        
        Args:
            key: S3 object key (path)
            expires_in: URL expiration time in seconds (default: 3600 = 1 hour)
        
        Returns:
            Presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                'put_object',
                Params={'Bucket': settings.S3_BUCKET, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    def generate_presigned_download_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generate a presigned URL for downloading from S3
        
        Args:
            key: S3 object key (path)
            expires_in: URL expiration time in seconds (default: 3600 = 1 hour)
        
        Returns:
            Presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.S3_BUCKET, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned download URL: {e}")
            raise Exception(f"Failed to generate presigned download URL: {str(e)}")
    
    def is_configured(self) -> bool:
        """Check if S3 service is properly configured"""
        return self._is_configured


# Singleton instance
s3_service = S3Service()
