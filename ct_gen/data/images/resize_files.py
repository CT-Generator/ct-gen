from PIL import Image
import os
SIZE = (215, 215)

def resize_images(directory, size):
    # Change to the directory
    os.chdir(directory)

    # Iterate through each image file in the directory
    for file in os.listdir(directory):
        if file.lower().endswith('.jpg'):  # Check for ".jpg" files
            img = Image.open(file)
            # Resize the image
            img = img.resize(size, Image.ANTIALIAS)  # Resize and keep quality
            img.save(file)  # Overwrite the original image
            print(f"Resized {file}")

# Call the function with your directory and desired size
resize_images(DIRECTORY, SIZE)
