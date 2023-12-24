import streamlit as st
import markdown
import weasyprint
from PyPDF2 import PdfWriter, PdfReader
from io import BytesIO
from reportlab.pdfgen import canvas

# Function to create a watermark
def create_watermark(content):
    packet = BytesIO()
    # Create a watermark canvas
    c = canvas.Canvas(packet, pagesize="A4")
    c.drawString(297.5, 421, content)  # positioning the watermark in the middle
    c.save()
    
    # Move to the beginning of the StringIO buffer
    packet.seek(0)
    new_pdf = PdfReader(packet)
    return new_pdf.pages[0]

# Streamlit app
def add_pdf_button(markdown_text):
    
    convert_button = st.button("Convert to PDF")

    if convert_button and markdown_text:
        # Convert Markdown to HTML
        html_text = markdown.markdown(markdown_text)
        
        # Convert HTML to PDF
        pdf = weasyprint.HTML(string=html_text).write_pdf()
        
        # Read the existing PDF
        existing_pdf = PdfReader(BytesIO(pdf))
        output = PdfWriter()
        
        # Add watermark to each page
        watermark = create_watermark("Conspiracy Theory")
        for i in range(existing_pdf.getNumPages()):
            page = existing_pdf.pages[i]
            page.merge_page(watermark)
            output.addPage(page)
        
        # Save the watermarked PDF to a byte stream
        outputStream = BytesIO()
        output.write(outputStream)
        watermarked_pdf = outputStream.getvalue()
        
        # Use Streamlit to download PDF
        st.download_button(label="Download PDF",
                           data=watermarked_pdf,
                           file_name="marked_document.pdf",
                           mime='application/pdf')