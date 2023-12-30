import streamlit as st
import os
import openai
import pandas as pd

from ct_gen.src.modules.page_nav import forward_button, backward_button, begin_button

from ct_gen.src.pages.page_1 import display_page_1
from ct_gen.src.pages.page_2 import display_page_2
from ct_gen.src.pages.page_3 import display_page_3
from ct_gen.src.pages.page_4 import display_page_4
from ct_gen.src.pages.page_5 import display_page_5
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict
from ct_gen.src.modules.authentication import check_password, load_secrets



# Load the secrets at the start of the app
secrets = load_secrets()

# Assign OpenAI key
openai.api_key = secrets["openai"]["api_key"]
openai.api_base = "https://api.openai.com/v1"

def main():
    initalize_session_state_dict()
    st.set_page_config(layout="centered",
                       page_title="Consipracy Generator",
                       page_icon = '🔦')


    css = """
    <style>
    img {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
        
    /* Selecting the div with the specific data-testid attribute */
    div[data-testid="column"] {
        display: flex; /* Using flexbox for centering */
        justify-content: center; /* Centering horizontally */
        align-items: center; /* Centering vertically */
        text-align: center; /* Ensuring the text inside is also centered, if needed */
        height: 100%; /* You might need to adjust or set a specific height */
    }
    div .stMarkdown {
        display: flex; /* Enables flexbox properties */
        align-items: center; /* Vertically centers content in the flex container */
        justify-content: center; /* Horizontally centers content in the flex container */
    }
    
    div .element-container {
        display: flex; /* Enables flexbox properties */
        align-items: center; /* Vertically centers content in the flex container */
        justify-content: center; /*   Horizontally centers content in the flex container */
    }
    
    div .row-widget {
        display: flex; /* Enables flexbox properties */
        align-items: center; /* Vertically centers content in the flex container */
        justify-content: center; Horizontally centers content in the flex container */
    }
    
    /*  .stButton>button {
        width: 33%;
        box-sizing: border-box;
        } */

    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

    if not check_password():
        st.stop()  # Do not continue if check_password is not True.

    # Rest of your code...
    if st.session_state["page_number"] == 1:
        checkbox_label = "I agree that the generated conspiracy theory, the choices that led to its creation, and my rating of it will be recorded anonymously."
        display_page_1()
        st.markdown("---")
        privacy_check = st.checkbox(checkbox_label)
        col1 = st.columns(1)[0]
        #col1 = st.columns(1)
        
        if privacy_check:
            forward_button(col1, "Start")
        

    if st.session_state["page_number"] == 2:
        display_page_2()
        st.markdown("---")
        col1 = st.columns(1)[0]
        # col1, col2 = st.columns(2)
        # backward_button(col1, "BACK")
        forward_button(col1, "NEXT")
        
        
    if st.session_state["page_number"] == 3:
        display_page_3()
        st.markdown("---")
        col1 = st.columns(1)[0]
        #col1, col2 = st.columns(2)
        #backward_button(col1, "BACK")
        forward_button(col1, "NEXT")
        
    
    if st.session_state["page_number"] == 4:
        display_page_4()
        st.markdown("---")
        col1 = st.columns(1)[0]
        #col1, col2 = st.columns(2)
        #backward_button(col1, "BACK")
        forward_button(col1, "NEXT")
        
    
    if st.session_state["page_number"] == 5:
        display_page_5()
        st.markdown("---")
        #col1 = st.columns(1)[0]
        col1 = st.columns(1)[0]
        #forward_button(col1, "EXPLANATION")
        begin_button(col1, "Generate a new story")
        #col1, col2 = st.columns(2)
        #backward_button(col1, "BACK")
    
    # if st.session_state["page_number"] == 6:
    #     display_page_6()
    #     st.markdown("---")
    #     #col1 = st.columns(1)[0]
    #     col1 = st.columns(1)[0]
    #     begin_button(col1, "Generate a new story")
    #     #col1, col2 = st.columns(2)
    #     #backward_button(col1, "BACK")
    
    

    col1, col2, col3 = st.columns([0.1,0.8,0.1])
    col2.warning('DISCLAIMER: False conspiracy theories can be harmful. We will screen out conspiracy theories targeting vulnerable groups or individuals. Please use our Conspiracy Generator with caution.', icon="⚠️")
    
    
if __name__ == '__main__':
    main()
    