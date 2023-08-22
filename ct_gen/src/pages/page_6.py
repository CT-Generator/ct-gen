import streamlit as st


#from initialize_session_state import initialize_session_state_dict
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

   

    # # Generate the conspiracy theory using OpenAI
    # with st.spinner('Generating your conspiracy theory...'):
    #     response = openai.ChatCompletion.create(
    #         model="gpt-4",  # Use the appropriate model name
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant."},
    #             {"role": "user", "content": prompt}
    #         ]
    #     )
    # # Save the generated conspiracy theory in the session state
    # #st.session_state.conspiracy_theory = response.choices[0].text.strip()
    # st.session_state.conspiracy_theory = response.choices[0].message['content'].strip()

# Create messages in conversation format
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for prompt in partial_prompts:
        messages.append({"role": "user", "content": prompt})
    messages.append({"role": "user", "content": main_prompt})

    # Generate the conspiracy theory using OpenAI
    with st.spinner('Generating your conspiracy theory...'):
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use the appropriate model name
            messages=messages
        )
    conspiracy_theory = response.choices[-1].message['content'].strip()
    
    return conspiracy_theory

    ###
    # Use the Moderation API to check for content policy violation
#     moderation_results = check_moderation(conspiracy_theory)

#     if moderation_results['results'][0]['flagged']:
#         violating_categories = [
#             category for category, violation in moderation_results['results'][0]['categories'].items() if violation
#         ]
#         print("The generated conspiracy theory violates OpenAI's content policy.")
#         print("Violating categories:", violating_categories)
#     else:
#         return conspiracy_theory

# def check_moderation(content):
#     api_key = secrets["openai"]["api_key"]
#     headers = {
#         'Content-Type': 'application/json',
#         'Authorization': f'Bearer {api_key}'
#     }
#     data = {
#         'text': content
#     }
#     response = requests.post('https://api.openai.com/v1/engines/content-moderation-v1/moderate', json=data, headers=headers)
#     moderation_results = response.json()
#     return moderation_results

    ###


def display_page_6():
    
    st.markdown("### Page 6")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 Your Conspiracy Theory")
    st.divider()
    generation_button = st.button("Generate your theory!")
    
    # if generation_button == True:
        
    #     generate_conspiracy_theory(st.session_state.selected_article_content, st.session_state.culprits, st.session_state.goals, st.session_state.motive_info)    
        
    # if st.session_state.conspiracy_theory != "":
    #     st.divider()
    #     st.info("Here is your conspiracy theory.") 
    #     st.divider()    
    #     st.write(st.session_state.conspiracy_theory)

    if generation_button:
        conspiracy_theory = generate_conspiracy_theory(
            st.session_state.selected_article_content,
            st.session_state.culprits,
            st.session_state.goals,
            st.session_state.motive_info
        )
        st.session_state.conspiracy_theory = conspiracy_theory

    if hasattr(st.session_state, 'conspiracy_theory') and st.session_state.conspiracy_theory != "":
        st.divider()
        st.info("Here is your conspiracy theory.")
        st.divider()
        st.write(st.session_state.conspiracy_theory)

    # Generate the conspiracy theory using OpenAI
    # with st.spinner('Generating conspiracy theory...'):
    #     response = openai.ChatCompletion.create(
    #         model="gpt-4",  # Use the appropriate model name
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant."},
    #             {"role": "user", "content": prompt}
    #         ]
    #     )
    # Save the generated conspiracy theory in the session state
    #st.session_state.conspiracy_theory = response.choices[0].text.strip()
    #st.session_state.conspiracy_theory = response.choices[0].message['content'].strip()



