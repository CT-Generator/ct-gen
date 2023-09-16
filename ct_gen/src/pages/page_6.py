import streamlit as st

import newspaper
from oauth2client.service_account import ServiceAccountCredentials
import os
import openai
import pandas as pd
import random
import requests
from streamlit_extras.badges import badge
import sys
import webbrowser

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict


def generate_conspiracy_theory(selected_article_content, culprits, goals, motive_info):
    # Access the user inputs from the session state
    url = st.session_state.url

    # Partial prompts from each step
    partial_prompts = [
        f"Connecting the dots...\n- Find inconsistencies in the timeline.\n- Highlight contradictions in witness statements.",
        f"Dealing with counterevidence...\n- Connect unconnected events to create intrigue.\n- Associate the culprits with unusual symbols.",
        f"Refuting counterevidence...\n- Label counterevidence as part of a larger cover-up.\n- Propose that evidence was planted to confuse.",
        f"Discrediting critics...\n- Label critics as government shills.\n- Suggest critics are manipulated by hidden powers."
    ]

    
    # Set up your prompt for generating the conspiracy theory
    main_prompt = f"Generate a conspiracy theory involving {culprits} and their goal to {goals}. " \
             f"They have orchestrated the creation of the official version as a cover-up for their evil plans, which says: '{selected_article_content}'. " \
             f"Their motive behind this conspiracy is to {motive_info}. " \
             "The truth is hidden and only those who 'wake up' can see it. [GENERATE GT]"

   
    
# Create messages in conversation format
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for prompt in partial_prompts:
        messages.append({"role": "user", "content": prompt})
    messages.append({"role": "user", "content": main_prompt})

    
    try:
        # Try to generate the conspiracy theory using GPT-4
        with st.spinner('Generating your conspiracy theory with GPT-4. This usually takes about 20-30 seconds.'):
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages
            )
        conspiracy_theory = response.choices[-1].message['content'].strip()

    except Exception as e:
        # If GPT-4 throws an error, fall back to GPT-3
        st.warning(f"An error occurred with GPT-4: {str(e)}. Falling back to GPT-3.")
        with st.spinner('Generating your conspiracy theory with GPT-3...'):
            response = openai.Completion.create(
                model="gpt-3.5",
                messages=messages
            )

    conspiracy_theory = response.choices[-1].message['content'].strip()
    
    return conspiracy_theory
   


def display_page_6():
    
    st.markdown("### Step 5")
    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")
    st.title("🔦 Your Conspiracy Theory")
    st.divider()
    generation_button = st.button("Generate your theory!")
    
    
    try:
        if generation_button:
            conspiracy_theory = generate_conspiracy_theory(
                st.session_state.selected_article_content,
                st.session_state.selected_culprit,
                st.session_state.goals,
                st.session_state.motive_info
            )
            st.session_state.conspiracy_theory = conspiracy_theory

        if hasattr(st.session_state, 'conspiracy_theory') and st.session_state.conspiracy_theory != "":
            st.divider()
            st.info("Here is your conspiracy theory.")
            st.divider()
            st.write(st.session_state.conspiracy_theory)
            

    except AttributeError:
        st.warning("It seems you haven't selected a story, conspirator, or motive. Please go back and make your selections.")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)

    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")


