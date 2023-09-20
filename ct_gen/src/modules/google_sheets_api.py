import streamlit as st
import gspread
import pandas as pd
import os
import toml
from oauth2client.service_account import ServiceAccountCredentials


# Function to load Google Sheets data
@st.cache_data(show_spinner=False)
def load_google_sheets_data(worksheet_name):
    
    secrets = toml.load(".streamlit/secrets.toml")
    # Define the scope and credentials for Google Sheets API
    # feeds for sheets, drive for Drive
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(secrets['google_sheets'], scope)
    
    # Authenticate and access the Google Sheets API
    gc = gspread.authorize(credentials)
    
    # Load the Google Sheets data
    spreadsheet_url = secrets['google_sheets']['spreadsheet']
    #worksheet_name = secrets['google_sheets']['worksheet']
    sheet = gc.open_by_url(spreadsheet_url).sheet1  # Replace 'sheet1' with the correct worksheet name if needed
    data = sheet.get_all_values()
    
    # Convert the data to a DataFrame
    df = pd.DataFrame(data[1:], columns=data[0])
    return df.loc[::-1]