import streamlit as st
import random
import base64
import os
from st_click_detector import click_detector
import pandas as pd


@st.cache_data(ttl=3600, show_spinner=False)
def select_random_items(df: pd.DataFrame, folder_path: str, change_tracker: int):
    sampled_df = df.sample(n=3)
    uuids = sampled_df["uuid"].to_list()
    file_names = [f'{str(x)}.jpg' for x in uuids]
    names = sampled_df["name"].to_list()
    summaries = sampled_df["summary"].to_list()
    images = [load_image(folder_path, file_name) for file_name in file_names]
    return uuids, names, summaries, images
    

def load_image(folder_path, file_name):
    with open(os.path.join(folder_path, file_name), "rb") as image:
        encoded = base64.b64encode(image.read()).decode()
        return f"data:image/jpeg;base64,{encoded}"
    
def add_line_breaks_after_n_words(s, n):
    """
    Add a <br> line break tag to the string 's' after every 'n' words.

    :param s: The input string.
    :param n: The number of words after which a line break is added.
    :return: The modified string with line breaks.
    """
    words = s.split()
    chunks = [' '.join(words[i:i+n]) for i in range(0, len(words), n)]
    return '<br>'.join(chunks)


def name_to_captions(name, n_words_per_line):
    return add_line_breaks_after_n_words(name, n_words_per_line)

def display_image_options(images, captions, key):
    
    content = '<div style="display: flex; flex-wrap: wrap; justify-content: space-around;">'
    for i, image in enumerate(images):
        new_img = f'<div style="margin: 10px; text-align: center;"><a href="#" id="{i}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p>{captions[i]}</p></div>'
        content =  content + new_img
    content = content + "</div>"
        
    selected_item = click_detector(content, key)
    return selected_item

def create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction):
    
    df = pd.read_excel("ct_gen/data/images_db.xlsx", sheet_name=sheet_name)
    uuids, names, summaries, images = select_random_items(df, image_path, st.session_state["change_tracker"])
    captions = [name_to_captions(name, 2) for name in names]

    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info)
    
    selected_item = display_image_options(images, captions, key=sheet_name)

    if selected_item:
        
        st.session_state[f"{sheet_name}_img"] = images[int(selected_item)]
        st.session_state[f"{sheet_name}_name"] = names[int(selected_item)]
        st.session_state[f"{sheet_name}_summary"] = summaries[int(selected_item)]
        st.session_state[f"{sheet_name}_caption"] = captions[int(selected_item)]
        
        if (st.session_state[f"{sheet_name}_name"] != "") and (st.session_state[f"{sheet_name}_summary"] != ""):
            
            #col1, col2, col3 = st.columns([0.25, 0.55, 0.2])
            
            name = st.session_state[f"{sheet_name}_name"]
            summary = st.session_state[f"{sheet_name}_summary"]
            
            st.markdown(f"### {name}")
            col1, col2 = st.columns([0.8, 0.2])
            col1.info(summary)
            col2.text("")
            load_more_button_1 = col2.button("load more", "load_more_button_1")
            if load_more_button_1:
                st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
                st.experimental_rerun()

    else:
        
        st.markdown(" ")
        st.warning(instruction)
        st.markdown(" ")
        st.markdown(" ")
        load_more_button_2 = st.button("load more", "load_more_button_2")
        if load_more_button_2:
            st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
            st.experimental_rerun()
            
        
def display_list_of_images(images, captions):
    
    
    images = [img for img in images if img]
    captions = [capt for capt in captions if capt]
    
    content = '<div style="display: flex; flex-wrap: wrap; justify-content: space-around;">'
    for i, image in enumerate(images):
        new_img = f'<div style="margin: 10px; text-align: center;"><a href="#" id="{i}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p>{captions[i]}</p></div>'
        content =  content + new_img
    content = content + "</div>"
        
    return click_detector(content, key="final_display")