import streamlit as st
import random
import base64
import os
from st_click_detector import click_detector
import pandas as pd

@st.cache_data(ttl=3600, show_spinner=False)
def select_random_file_names(folder_path, n_random_files, change_tracker):
    all_image_names = os.listdir(folder_path)
    file_names = random.sample(all_image_names, n_random_files) if len(all_image_names) >= n_random_files else all_image_names
    return file_names

# @st.cache_data()
# def load_images(folder_path, file_names):
    
#     image_paths = [os.path.join(folder_path, file_name) for file_name in file_names]
    
#     images = []
#     for file in image_paths:
#         with open(file, "rb") as image:
#             encoded = base64.b64encode(image.read()).decode()
#             images.append(f"data:image/jpeg;base64,{encoded}")
#     return images

@st.cache_data()
def load_images(folder_path, file_names):
    
    image_paths = [os.path.join(folder_path, file_name) for file_name in file_names]
    
    images = []
    for file in image_paths:
        with open(file, "rb") as image:
            encoded = base64.b64encode(image.read()).decode()
            images.append(f"data:image/jpeg;base64,{encoded}")
    return images



def add_line_breaks_after_n_words(s, n):
    """
    Add a <br> line break tag to the string 's' after every 'n' words.

    :param s: The input string.
    :param n: The number of words after which a line break is added.
    :return: The modified string with line breaks.
    """
    words = s.split()
    # Break the words list into chunks of size n
    chunks = [' '.join(words[i:i+n]) for i in range(0, len(words), n)]
    # Join the chunks with the <br> tag
    return '<br>'.join(chunks)

def display_image_options(df, images, img_uuids, key):
    
    names = df[df["uuid"].isin([str(x).split(".jpg")[0] for x in img_uuids])]["name"].to_list()
    content = '<div style="display: flex; flex-wrap: wrap; justify-content: space-around;">'
    
    for i, image in enumerate(images):
        new_img = f'<div style="margin: 10px; text-align: center;"><a href="#" id="{img_uuids[i].split(".")[0]}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p>{add_line_breaks_after_n_words(names[i], 2)}</p></div>'
        content =  content + new_img
    content = content + "</div>"
        
    selected_image = click_detector(content, key)
    return selected_image

def create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction):
    
    
    df = pd.read_excel("ct_gen/data/images_db.xlsx", sheet_name=sheet_name)
    img_uuids = select_random_file_names(image_path, n_random_files=3, change_tracker = st.session_state["change_tracker"])
    images = load_images(folder_path=image_path, file_names=img_uuids)
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info)
    
    selected_item = display_image_options(df, images, img_uuids, key=sheet_name)
    
    
    if selected_item:

        st.session_state[f"{sheet_name}_name"] = df[df["uuid"] == selected_item]["name"].iloc[0]
        st.session_state[f"{sheet_name}_summary"] = df[df["uuid"] == selected_item]["summary"].iloc[0]
        
        if (st.session_state[f"{sheet_name}_name"] != "") and (st.session_state[f"{sheet_name}_summary"] != ""):
            
            col1, col2, col3 = st.columns([0.25, 0.55, 0.2])
            name = st.session_state[f"{sheet_name}_name"]
            summary = st.session_state[f"{sheet_name}_summary"]
            
            col1.markdown(f"### {name}")
            col2.info(summary)
            col3.text("")
            load_more_button_1 = col3.button("load more", "load_more_button_1")
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