import markdown2
import imgkit
from io import BytesIO

def markdown_to_image(markdown_text, css_path):
    # Convert Markdown to HTML
    html_content = markdown2.markdown(markdown_text)
    
    # Convert HTML to an image
    imgkit_options = {'format': 'jpg'}
    img_bytes = imgkit.from_string(html_content,False, options= imgkit_options, css= css_path)
    return img_bytes