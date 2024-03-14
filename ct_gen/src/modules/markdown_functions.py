import markdown2
import imgkit
from io import BytesIO

def markdown_to_image(markdown_text):
    # Convert Markdown to HTML
    html_content = markdown2.markdown(markdown_text)

    # Convert HTML to an image
    imgkit_options = {'format': 'png'}
    img_bytes = imgkit.from_string(html_content, False, options=imgkit_options)

    return img_bytes