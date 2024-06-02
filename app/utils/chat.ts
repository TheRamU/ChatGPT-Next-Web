export function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(URL.createObjectURL(file))
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then((imageBitmap) => {
        let canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        let ctx = canvas.getContext("2d");
        let width = imageBitmap.width;
        let height = imageBitmap.height;
        let quality = 0.9;

        const checkSizeAndPostMessage = () => {
          canvas
            .convertToBlob({ type: "image/jpeg", quality: quality })
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = function () {
                const base64data = reader.result;
                if (typeof base64data !== "string") {
                  reject("Invalid base64 data");
                  return;
                }
                if (base64data.length < maxSize) {
                  resolve(base64data);
                  return;
                }
                if (quality > 0.5) {
                  // Prioritize quality reduction
                  quality -= 0.1;
                } else {
                  // Then reduce the size
                  width *= 0.9;
                  height *= 0.9;
                }
                canvas.width = width;
                canvas.height = height;

                ctx?.drawImage(imageBitmap, 0, 0, width, height);
                checkSizeAndPostMessage();
              };
              reader.readAsDataURL(blob);
            });
        };
        ctx?.drawImage(imageBitmap, 0, 0, width, height);
        checkSizeAndPostMessage();
      })
      .catch((error) => {
        throw error;
      });
  });
}
