#!/bin/bash
# 🎬 تحويل كل الـ GIFs في المشروع إلى WebM + MP4
# 
# المتطلبات: ffmpeg
# تثبيت: brew install ffmpeg (Mac) أو apt install ffmpeg (Linux)
#
# الاستخدام: ./convert-gifs.sh ./public/images

INPUT_DIR=${1:-"./public/images"}
OUTPUT_DIR="./public/videos"

mkdir -p "$OUTPUT_DIR"

echo "🔍 البحث عن GIFs في $INPUT_DIR..."

find "$INPUT_DIR" -name "*.gif" -type f | while read -r gif; do
  filename=$(basename "$gif" .gif)
  filesize=$(du -h "$gif" | cut -f1)
  
  echo "📦 $filename.gif ($filesize)"
  
  # WebM (الأخف - VP9)
  echo "  → تحويل إلى WebM..."
  ffmpeg -i "$gif" \
    -c:v libvpx-vp9 \
    -b:v 0 -crf 30 \
    -an \
    -loop 0 \
    "$OUTPUT_DIR/$filename.webm" \
    -y -loglevel error
  
  # MP4 (Fallback - H.264)
  echo "  → تحويل إلى MP4..."
  ffmpeg -i "$gif" \
    -c:v libx264 \
    -pix_fmt yuv420p \
    -crf 23 \
    -an \
    -movflags +faststart \
    "$OUTPUT_DIR/$filename.mp4" \
    -y -loglevel error
  
  # مقارنة الأحجام
  webm_size=$(du -h "$OUTPUT_DIR/$filename.webm" | cut -f1)
  mp4_size=$(du -h "$OUTPUT_DIR/$filename.mp4" | cut -f1)
  
  echo "  ✅ $filename.gif ($filesize) → WebM ($webm_size) | MP4 ($mp4_size)"
  echo ""
done

echo "🎉 تم التحويل! الـ videos في: $OUTPUT_DIR"