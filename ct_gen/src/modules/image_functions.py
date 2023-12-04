import streamlit as st
import random
import base64
import os
from st_click_detector import click_detector

@st.cache_data(ttl=3600, show_spinner=False)
def select_random_file_names(folder_path, n_random_files, change_tracker):
    all_image_names = os.listdir(folder_path)
    file_names = random.sample(all_image_names, n_random_files) if len(all_image_names) >= n_random_files else all_image_names
    return file_names

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

def display_image_options(images, random_culprits, key):
    
    content = '<div style="display: flex; flex-wrap: wrap; justify-content: space-around;">'
    
    for i, image in enumerate(images):
        new_img = f'<div style="margin: 10px; text-align: center;"><a href="#" id="{random_culprits[i].split(".")[0]}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p>{add_line_breaks_after_n_words(random_culprits[i].split(".")[0], 2)}</p></div>'
        content =  content + new_img
    content = content + "</div>"
        
    selected_image = click_detector(content, key)
    return selected_image