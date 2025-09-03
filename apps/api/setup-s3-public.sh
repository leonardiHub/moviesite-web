#!/usr/bin/env bash
set -euo pipefail

# Requires AWS CLI with credentials already exported in env:
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET

: "${AWS_S3_BUCKET:?Set AWS_S3_BUCKET}"
: "${AWS_REGION:=ap-southeast-1}"

echo "Making s3://$AWS_S3_BUCKET publicly readable in $AWS_REGION ..."

# 1) Allow public policies & ACLs (disable account-level block on this bucket)
aws s3api put-public-access-block \
  --bucket "$AWS_S3_BUCKET" \
  --public-access-block-configuration \
BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false \
  --region "$AWS_REGION"

# 2) Attach a bucket policy that allows public READ of objects
read -r -d '' POLICY <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [ "s3:GetObject" ],
      "Resource": "arn:aws:s3:::${AWS_S3_BUCKET}/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket "$AWS_S3_BUCKET" \
  --policy "$POLICY" \
  --region "$AWS_REGION"

# 3) (Optional) Verify policy status
aws s3api get-bucket-policy-status \
  --bucket "$AWS_S3_BUCKET" \
  --region "$AWS_REGION" || true

echo "Done. Objects in s3://$AWS_S3_BUCKET/* are publicly readable."
