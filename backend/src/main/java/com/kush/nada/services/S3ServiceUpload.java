package com.kush.nada.services;

import com.amazonaws.services.s3.AmazonS3;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.amazonaws.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@Service
public class S3ServiceUpload {

    private final AmazonS3 amazonS3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public S3ServiceUpload(AmazonS3 amazonS3Client) {
        this.amazonS3Client = amazonS3Client;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        File fileObj = convertToFile(file);

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        amazonS3Client.putObject(new PutObjectRequest(bucketName, fileName, fileObj));

        String imageUrl = amazonS3Client.getUrl(bucketName, fileName).toString();

        fileObj.delete();

        return imageUrl;
    }

    private File convertToFile(MultipartFile file) throws IOException {
        File convertedFile = new File(file.getOriginalFilename());
        try (FileOutputStream foo = new FileOutputStream(convertedFile)) {
            foo.write(file.getBytes());
        }
        return convertedFile;
    }
}