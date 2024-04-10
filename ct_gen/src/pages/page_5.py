import streamlit as st
import os
from openai import OpenAI
import toml
from ct_gen.src.modules.image_functions import display_list_of_images
from ct_gen.src.modules.rating_buttons import add_rating_buttons
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet, connect_to_google_sheets_data
#from ct_gen.src.modules.pdf_download import add_pdf_button
import streamlit.components.v1 as components
from ct_gen.src.pages.page_recipe import display_page_recipe
from ct_gen.src.modules.scroll_up import scroll_up
from ct_gen.src.modules.markdown_functions import markdown_to_image
from PIL import Image, ImageDraw, ImageFont
import io
import base64



def selections_merger(images_list, captions_list):
    if len(images_list) != len(captions_list):
        return 0
    
    for elem in images_list:
        if elem is None:
            return 0
        
    for elem in captions_list:
        if elem is None:
            return 0

    
    # Save the Streamlit app's content to an in-memory byte stream
    
    images = [Image.open(io.BytesIO(base64.b64decode(images_list[0].split(',')[1]))),
              Image.open(io.BytesIO(base64.b64decode(images_list[1].split(',')[1]))),
              Image.open(io.BytesIO(base64.b64decode(images_list[2].split(',')[1])))]
    
    # Set up font and text color for captions
    current_dir = os.getcwd()   
    FONTS_DIR = os.getcwd() + "/ct_gen/data/fonts/"
    print (FONTS_DIR)
    font = ImageFont.truetype(FONTS_DIR + "arial.ttf", 15)
    text_color = (255, 255, 255)  # White

    # Add Headers to images:
    """
    draw_1 = ImageDraw.Draw(images[0])
    rectangle_height = 25
    rectangle_width = images[0].width
    rectangle_position = (0, 0)
    draw_1.rectangle([rectangle_position, (rectangle_position[0] + rectangle_width, rectangle_position[1] + rectangle_height)], fill=(0, 0, 0))
    text_position = ((images[0].width - draw_1.textsize("STORY", font=font)[0]) // 2, (rectangle_height - draw_1.textsize("STORY", font=font)[1]) // 2)
    draw_1.text(text_position, "STORY", font=font, fill=text_color, align='center')

    draw_2 = ImageDraw.Draw(images[0])
    rectangle_height = 25
    rectangle_width = images[0].width
    rectangle_position = (0, 0)
    draw_2.rectangle([rectangle_position, (rectangle_position[0] + rectangle_width, rectangle_position[1] + rectangle_height)], fill=(0, 0, 0))
    text_position = ((images[0].width - draw_2.textsize("CULPRIT", font=font)[0]) // 2, (rectangle_height - draw_2.textsize("CULPRIT", font=font)[1]) // 2)
    draw_2.text(text_position, "CULPRIT", font=font, fill=text_color, align='center')
    """

    # Add rectangles and text to images
    draw_1 = ImageDraw.Draw(images[0])
    rectangle_height = 25
    rectangle_width = images[0].width
    rectangle_position = (0, 0)
    draw_1.rectangle([rectangle_position, (rectangle_position[0] + rectangle_width, rectangle_position[1] + rectangle_height)], fill=(0, 0, 0))
    text_position = ((images[0].width - draw_1.textsize("STORY", font=font)[0]) // 2, (rectangle_height - draw_1.textsize("STORY", font=font)[1]) // 2)
    draw_1.text(text_position, "STORY", font=font, fill=text_color)

    draw_2 = ImageDraw.Draw(images[1])
    rectangle_height = 25
    rectangle_width = images[1].width
    rectangle_position = (0, 0)
    draw_2.rectangle([rectangle_position, (rectangle_position[0] + rectangle_width, rectangle_position[1] + rectangle_height)], fill=(0, 0, 0))
    text_position = ((images[1].width - draw_2.textsize("CULPRIT", font=font)[0]) // 2, (rectangle_height - draw_2.textsize("CULPRIT", font=font)[1]) // 2)
    draw_2.text(text_position, "CULPRIT", font=font, fill=text_color)

    draw_3 = ImageDraw.Draw(images[2])
    rectangle_height = 25
    rectangle_width = images[2].width
    rectangle_position = (0, 0)
    draw_3.rectangle([rectangle_position, (rectangle_position[0] + rectangle_width, rectangle_position[1] + rectangle_height)], fill=(0, 0, 0))
    text_position = ((images[2].width - draw_3.textsize("MOTIVE", font=font)[0]) // 2, (rectangle_height - draw_3.textsize("MOTIVE", font=font)[1]) // 2)
    draw_3.text(text_position, "MOTIVE", font=font, fill=text_color)

    
    # Combine images into one:
    widths, heights = zip(*(img.size for img in images))
    max_height = max(heights)
    total_width = sum(widths)
    combined_image = Image.new('RGB', (total_width, max_height))
    x_offset = 0
    for img in images:
        combined_image.paste(img, (x_offset, 0))
        x_offset += img.size[0]

    # Convert the combined image to bytes
    combined_image_bytes = io.BytesIO()
    combined_image.save(combined_image_bytes, format='PNG')
    return combined_image_bytes



def create_prompt():
    selected_article_content = st.session_state["news_summary"]
    culprits = st.session_state["culprits_name"]
    culprits_info = st.session_state["culprits_summary"]
    motive = st.session_state["motives_name"]
    motive_info = st.session_state["motives_summary"]
        
    prompt = f"""Write a convicing conspiracy theory by turning the following news story into a conspiracy theory: {selected_article_content}.
        The conspirator(s) of your story are: {culprits} ({culprits_info}).
        The motive of these conspirators: {motive} ({motive_info}).
        You construct the conspiracy by following these steps:
        You find some suspicious loopholes, puzzling details and anomalies in the official story. You 'just ask questions' in the style of conspiracy theorists.
        You fabricate some 'evidence' that {selected_article_content} is a cover-up of {culprits} trying to achieve {motive}. You 'connect the dots' in the style of conspiracy theorists, using available information about {culprits}.
        You anticipate counterarguments against the conspiracy theory by arguing that missing evidence and counterevidence is in fact part of the plot. Make sure to make the conspiracy theory immune against criticism
        You discredit people who are sceptical of the conspiracy theory by suggesting they are gullible dupes or patsies complicit in the conspiracy
        Write a convicing story starting with a catchy title. Simplify the story to a reading level of grade ten and shorten the story. Everything must be formated in markdown."""

    return prompt

def create_summary_prompt():
    selected_article_content = st.session_state["news_summary"]
    prompt = f"""Summarize the following news story: {selected_article_content}."""
    
    return prompt


    
# Load the secrets at the start of the app
def load_secrets():
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")
    secrets = toml.load(secrets_file_path)
    return secrets

# Generate CT function
@st.cache_data()
def generate_conspiracy_theory(prompt, _client):
    res_box = st.empty()
    report = []

    stream = _client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an educational tool. You show people how easy it is to turn anything into a conspiracy. By doing so, you are able to teach people that they should not believe in conspiracies without careful examination."},
            {"role": "user", "content": prompt},
            ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            report.append(chunk.choices[0].delta.content)
            result = "".join(report).strip()
            res_box.markdown(f'{result}') 
    disclaimer = "Warning: This conspiracy story is FAKE and was generated with the Conspiracy Generator, an educational tool."
    report.append(disclaimer)
    st.session_state["conspiracy_theory"] = "".join(report).strip()

# Generate News Story Summary function
@st.cache_data()
def summarize_news_story(summary_prompt, _client):
    res_box = st.empty()
    report = []

    stream = _client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an educational tool. You should summarize the news story given to you."},
            {"role": "user", "content": summary_prompt},
            ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            report.append(chunk.choices[0].delta.content)
            result = "".join(report).strip()
            res_box.markdown(f'{result}') 
            
    st.session_state["summarized_news_story"] = "".join(report).strip() 

def create_twitter_button(image):
    post_text = f"I’ve just made my own conspiracy theory with the Conspiracy Generator!\n\
&#9989 Official story: {st.session_state['news_name']}\n\
&#9989 Culprits: {st.session_state['culprits_name']}\n\
&#9989 Motive: {st.session_state['motives_name']}\n\
Make your own conspiracy here:"
    # Shortened Link: https://rb.gy/ijujlh
    components.html(
    f"""
        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" 
        data-text="{post_text}"
        data-url="https://conspiracy-generator.streamlit.app/"
        data-show-count="false">
        data-size="Large"
        data-hashtags="streamlit,conspiracy"
        Tweet
        </a>
        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    """
    )

  
# Display page
def display_page_5():
    #initalize_session_state_dict()
    step_title = "Step 4"
    title = "Your Conspiracy Theory"
    info = "See how your selection of culprits and motives turns a simple news story into a conspiracy theory."
    
    ct_sheet = connect_to_google_sheets_data("generated_ct")
    ratings_sheet = connect_to_google_sheets_data("ratings")
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info)
    scroll_up()
    
    # Load the secrets at the start of the app
    secrets = load_secrets()
    client = OpenAI(api_key=secrets["openai"]["api_key"])
    images_list = [st.session_state["news_img"], st.session_state["culprits_img"], st.session_state["motives_img"]]
    captions_list = [st.session_state["news_caption"],st.session_state["culprits_caption"], st.session_state["motives_caption"]]
    captions = ["STORY:\n\n" + st.session_state["news_caption"], "CULPRIT:\n\n" + st.session_state["culprits_caption"], "MOTIVE:\n\n" + st.session_state["motives_caption"]]
    display_list_of_images(images_list, captions)
    
    st.session_state["prompt"] = create_prompt()
    st.session_state["summary_prompt"] = create_summary_prompt()

    st.divider()
    
    with st.expander('Summary of original News Story'):
        summarize_news_story(st.session_state["summary_prompt"], client)
    generate_conspiracy_theory(st.session_state["prompt"], client)
    
    with st.expander('What’s the recipe for a great conspiracy theory?'):
        display_page_recipe()
    
    if st.session_state["ct_saved"] == False:
        
        ct_row = [
        st.session_state["news_name"],
        st.session_state["news_summary"],
        st.session_state["culprits_name"],
        st.session_state["culprits_summary"],
        st.session_state["motives_name"],
        st.session_state["motives_summary"],
        st.session_state["prompt"],
        st.session_state["conspiracy_theory"]
        ]
        insert_row_to_sheet(ct_sheet, ct_row)
        st.session_state["ct_saved"] = True
    
    if st.button('Recreate your conspiracy theory'):
        st.markdown(f"<h3 style='text-align: center;'>Recreated Story</h3>", unsafe_allow_html=True)
        generate_conspiracy_theory.clear()
        generate_conspiracy_theory(st.session_state["prompt"], client)
        

   # Convert Markdown to an image
    image_bytes = markdown_to_image(st.session_state["conspiracy_theory"])

    # Display the image in Streamlit
    st.image(image_bytes, caption='Generated Conspiracy Theory', use_column_width=True)

    # Download button for images:
    st.markdown(f"<h3 style='text-align: center;'><b>Download images & Share</b></h3>", unsafe_allow_html=True)
    col1,col2 = st.columns(2)
    with col1:
        st.download_button('Download Selections', data=selections_merger(images_list, captions_list), file_name='CT Selections.png')

    with col2:
        st.download_button('Download Conspiracy Theory', data=image_bytes, file_name='Conspiracy Theory.png')
    create_twitter_button(image_bytes)
    st.markdown(f"<h3 style='text-align: center;'><b>Rate us!</b></h3>", unsafe_allow_html=True)    
    add_rating_buttons(ct_sheet, ratings_sheet)
    
    
    # if st.session_state["conspiracy_theory"] != "":
    #     add_pdf_button(st.session_state["conspiracy_theory"])
