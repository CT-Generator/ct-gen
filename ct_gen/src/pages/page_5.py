import streamlit as st
import os
import openai
import toml
from ct_gen.src.modules.image_functions import display_list_of_images
from ct_gen.src.modules.rating_buttons import add_rating_buttons
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet, connect_to_google_sheets_data
#from ct_gen.src.modules.pdf_download import add_pdf_button
import streamlit.components.v1 as components
from ct_gen.src.pages.page_recipe import display_page_recipe
from ct_gen.src.modules.scroll_up import scroll_up
from ct_gen.src.modules.markdown_functions import markdown_to_image


def selections_merger(images_list, captions_list):
    additional_items = ['STORY', 'CULPRIT', 'MOTIVES']
    
    # Check if both lists are of the same size
    if len(captions_list) != len(additional_items):
        raise ValueError("The captions_list and additional_items lists must be of the same size.")
    
    # Concatenate the additional items to captions_list elements
    modified_captions_list = [f"{additional_items[i]}: {captions_list[i]}" for i in range(len(captions_list))]
    
    content = '<table style="width: 100%; table-layout: fixed;"><tr>'
    for i, image in enumerate(images_list):
        new_img = f'<td style="width: 200px; text-align: center; padding: 5px; vertical-align: top;"><a href="#" id="{i}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p style="margin: 2px;">{modified_captions_list[i]}</p></td>'
        content = content + new_img
    content = content + "</tr></table>"
    
    return markdown_to_image(content, "ct_gen/data/css/selections-img.css")


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
def generate_conspiracy_theory(prompt, api_key):
    res_box = st.empty()
    report = []

    # Set the OpenAI API key
    openai.api_key = api_key

    # Use the completion endpoint for streaming
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an educational tool. You show people how easy it is to turn anything into a conspiracy. By doing so, you are able to teach people that they should not believe in conspiracies without careful examination."},
            {"role": "user", "content": prompt},
        ],
        stream=True,
    )
    
    for chunk in response:
        if chunk.choices[0].delta.get("content"):
            report.append(chunk.choices[0].delta.content)
            result = "".join(report).strip()
            res_box.write(result, unsafe_allow_html=True) 
    
    disclaimer = "<br><p>**Warning: This conspiracy story is FAKE and was generated with the Conspiracy Generator, an educational tool.**</p>"
    report.append(disclaimer)
    st.session_state["conspiracy_theory"] = "".join(report).strip()

# Generate News Story Summary function
@st.cache_data()
def summarize_news_story(summary_prompt, api_key):
    res_box = st.empty()
    report = []

    # Set the OpenAI API key
    openai.api_key = api_key

    # Use the completion endpoint for streaming
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an educational tool. You should summarize the news story given to you."},
            {"role": "user", "content": summary_prompt},
        ],
        stream=True,
    )
    
    for chunk in response:
        if chunk.choices[0].delta.get("content"):
            report.append(chunk.choices[0].delta.content)
            result = "".join(report).strip()
            res_box.markdown(f'{result}') 
            
    st.session_state["summarized_news_story"] = "".join(report).strip()

def create_twitter_button():
    post_text = f"I've just made my own conspiracy theory with the Conspiracy Generator!\n\
&#9989 Official story: {st.session_state['news_name']}\n\
&#9989 Culprits: {st.session_state['culprits_name']}\n\
&#9989 Motive: {st.session_state['motives_name']}\n\
Make your own conspiracy here:"
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
    api_key = secrets["openai"]["api_key"]
    
    images_list = [st.session_state["news_img"], st.session_state["culprits_img"], st.session_state["motives_img"]]
    captions_list = [st.session_state["news_caption"],st.session_state["culprits_caption"], st.session_state["motives_caption"]]
    captions = ["STORY:\n\n" + st.session_state["news_caption"], "CULPRIT:\n\n" + st.session_state["culprits_caption"], "MOTIVE:\n\n" + st.session_state["motives_caption"]]
    display_list_of_images(images_list, captions)
    
    st.session_state["prompt"] = create_prompt()
    st.session_state["summary_prompt"] = create_summary_prompt()

    st.divider()
    
    with st.expander('Summary of original News Story'):
        summarize_news_story(st.session_state["summary_prompt"], api_key)
    generate_conspiracy_theory(st.session_state["prompt"], api_key)
    
    with st.expander("What's the recipe for a great conspiracy theory?"):
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
        generate_conspiracy_theory(st.session_state["prompt"], api_key)
        

   # Convert Markdown to an image
    ct_image_bytes = markdown_to_image(st.session_state["conspiracy_theory"], "ct_gen/data/css/CT-img.css")
    selections_image_bytes = selections_merger(images_list, captions_list)
    # Display the image in Streamlit
    # st.image(image_bytes, caption='Generated Conspiracy Theory', use_column_width=True)

    # Download button for images:
    st.markdown(f"<h3 style='text-align: center;'><b>Download images & Share</b></h3>", unsafe_allow_html=True)
    col1,col2 = st.columns(2)
    with col1:
        st.download_button('Download Selections Image', data=selections_image_bytes, file_name='CT Selections.jpg')

    with col2:
        st.download_button('Download Conspiracy Theory Image', data=ct_image_bytes, file_name='Conspiracy Theory.jpg')
    
    scol1,scol2,scol3,scol4,scol5 = st.columns(5)
    with scol3:
        create_twitter_button()
    
    st.markdown(f"<h3 style='text-align: center;'><b>Rate us!</b></h3>", unsafe_allow_html=True)    
    add_rating_buttons(ct_sheet, ratings_sheet)
    
    
    # if st.session_state["conspiracy_theory"] != "":
    #     add_pdf_button(st.session_state["conspiracy_theory"])
