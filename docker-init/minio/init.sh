#!/bin/sh
# Wait until MinIO is up
sleep 10;

# Configure the local alias 'myminio' pointing to the MinIO container
/usr/bin/mc alias set myminio http://lms-minio:9000 minioadmin minioadmin

# Create the requested buckets, ignoring if they already exist
/usr/bin/mc mb myminio/exlms-files --ignore-existing
/usr/bin/mc mb myminio/exlms-resources --ignore-existing

# Set public download access (read-only for anonymous users)
/usr/bin/mc anonymous set download myminio/exlms-files
/usr/bin/mc anonymous set download myminio/exlms-resources

# Recursively copy all items from the attached /assets folder into the resource bucket
/usr/bin/mc cp -r /assets/ myminio/exlms-files/

echo "MinIO Auto-initialization completed successfully."
