import streamlit as st
import os
import openai
import pandas as pd
from openai import OpenAI
import toml
from ct_gen.src.modules.image_functions import display_list_of_images
from ct_gen.src.modules.rating_buttons import add_rating_buttons
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet, connect_to_google_sheets_data
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict
#from ct_gen.src.modules.pdf_download import add_pdf_button
import streamlit.components.v1 as components

def create_prompt():
    selected_article_content = st.session_state["news_summary"]
    culprits = st.session_state["culprits_name"]
    culprits_info = st.session_state["culprits_summary"]
    motive = st.session_state["motives_name"]
    motive_info = st.session_state["motives_summary"]
        
    prompt = f"""Write a convicing conspiracy theory by turning the following news story into a conspiracy theory: {selected_article_content}
        The conspirator(s) of your story are: {culprits} ({culprits_info}).
        The motive of these conspirators: {motive} ({motive_info}).
        You construct the conspiracy by following these steps:
        You find some suspicious loopholes, puzzling details and anomalies in the official story. You 'just ask questions' in the style of conspiracy theorists.
        You fabricate some 'evidence' that {selected_article_content} is a cover-up of {culprits} trying to achieve {motive}. You 'connect the dots' in the style of conspiracy theorists, using available information about {culprits}.
        You anticipate counterarguments against the conspiracy theory by arguing that missing evidence and counterevidence is in fact part of the plot. Make sure to make the conspiracy theory immune against criticism
        You discredit people who are sceptical of the conspiracy theory by suggesting they are gullible dupes or patsies complicit in the conspiracy
        Write a convicing story starting with a catchy title. Everything must be formated in markdown."""

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
            
    st.session_state["conspiracy_theory"] = "".join(report).strip()

def create_twitter_button():
   components.html(
    f"""
        <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" 
        data-text="I’ve just generated a conspiracy about {st.session_state['news_name']} with the Conspiracy Generator. This is an educational tool that lets you make funny conspiracy theories with AI to learn how to spot them. In my story {st.session_state['culprits_name']} are behind it because they want to {st.session_state['motives_name']} 😊. You can make your own here https://conspiracy-generator.streamlit.app/ !" 
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
    
    # Load the secrets at the start of the app
    secrets = load_secrets()
    client = OpenAI(api_key=secrets["openai"]["api_key"])
    images = [st.session_state["news_img"], st.session_state["culprits_img"], st.session_state["motives_img"]]
    captions = ["STORY:\n\n" + st.session_state["news_caption"], "CULPRIT:\n\n" + st.session_state["culprits_caption"], "MOTIVE:\n\n" + st.session_state["motives_caption"]]
    
    display_list_of_images(images, captions)
    
    st.session_state["prompt"] = create_prompt()
   
    st.divider()
    
    generate_conspiracy_theory(st.session_state["prompt"], client)
    
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
    
    add_rating_buttons(ct_sheet, ratings_sheet)
    create_twitter_button()
    
    # if st.session_state["conspiracy_theory"] != "":
    #     add_pdf_button(st.session_state["conspiracy_theory"])