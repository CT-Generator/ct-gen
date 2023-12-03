import streamlit as st
import base64

import os
import openai
import pandas as pd
import random

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from st_clickable_images import clickable_images
from st_click_detector import click_detector




@st.cache_data(ttl=3600, show_spinner=False)
def select_random_file_names(folder_path, n_random_files=3, change_tracker=st.session_state["change_tracker"]):
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

# Moderation endpoint
def moderate_text(text):
    try:
        response = openai.Moderation.create(
            input=text
        )
        
        if any(result['flagged'] for result in response['results']):
            return False, "Content is not appropriate."
        return True, "Content is appropriate."

    except Exception as e:
        print(f"Error in moderation: {str(e)}")
        return False, "Failed to moderate content."

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



def display_page_3():
    
    st.markdown("### Step 2")
    st.title("🐍 The Conspirators")
    
    st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    st.write("Click on a culprit to see the summary below:")
    
    
    culprits_df = load_google_sheets_data("culprits")
    random_culprits = select_random_file_names("ct_gen/data/images/culprits", n_random_files=3, change_tracker = st.session_state["change_tracker"])
    
    images = load_images(folder_path="ct_gen/data/images/culprits", file_names=random_culprits)
    
    #random_culprits_ = random_culprits + ["Load More"]
    #images_ = images + load_images(folder_path="ct_gen/data/images/functional", file_names=["Load_more_button.jpg"])
    
    content = '<div style="display: flex; flex-wrap: wrap; justify-content: space-around;">'
    
    for i, image in enumerate(images):
        new_img = f'<div style="margin: 10px; text-align: center;"><a href="#" id="{random_culprits[i].split(".")[0]}"><img src={image} alt="Image 1" style="width: 100%; max-width: 200px; height: auto;"></a><p>{add_line_breaks_after_n_words(random_culprits[i].split(".")[0], 2)}</p></div>'
        content =  content + new_img
    content = content + "</div>"
        
    selected_culprit = click_detector(content, key="culprit")
    
    
    if "click_counter" not in st.session_state:
        st.session_state["click_counter"] = 0
    if "click_counter_comp" not in st.session_state:
        st.session_state["click_counter_comp"] = st.session_state["click_counter"] + 1
    
    if selected_culprit:
        if selected_culprit != "Load More":
            st.session_state["selected_culprit"] = selected_culprit
            st.session_state["selected_culprit_info"] = culprits_df[culprits_df["Culprits"] == selected_culprit]["Culprit_Info"].iloc[0]
            
            # Displaying the selected culprit and its info if it exists in session state
            if "selected_culprit" in st.session_state and "selected_culprit_info" in st.session_state:
                
                
                col1, col2, col3 = st.columns([0.25, 0.55, 0.2])
                col1.markdown(f"### {st.session_state.selected_culprit}")
                col2.info(st.session_state.selected_culprit_info)
                col3.text("")
                load_more_button_1 = col3.button("load more", "load_more_button_1")
                if load_more_button_1:
                    st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
                    st.experimental_rerun()
    
    else:
        col1, col2 = st.columns([0.8, 0.2])
        col1.warning("Select a culprit")
        col2.text("")
        load_more_button_2 = col2.button("load more", "load_more_button_2")
        if load_more_button_2:
            st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
            st.experimental_rerun()
        
        
    # Add the reload button
    #if col3.button("Load New Culprits"):
    #    if "culprits_list" in st.session_state:
    #        del st.session_state.culprits_list
    #    st.cache_data.clear()  # Clear the cache
    #    st.experimental_rerun()  # Rerun the app


    
    # USER INPUT SECTION
    
    #user_input = st.text_input("Please paste your culprit here and hit Enter:")
    #if user_input:
    #    is_appropriate, message = moderate_text(user_input)
    #    if is_appropriate:
    #        st.session_state.user_input = user_input
    #        st.write(f"You entered: {user_input}")

            # Store the pasted culprit in session state
    #        st.session_state.selected_culprit = None
    #        st.session_state.selected_culprit = user_input
    #    else:
    #        st.error(message)


    


















        


