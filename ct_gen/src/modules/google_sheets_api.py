import streamlit as st
import gspread
import pandas as pd
import toml
from oauth2client.service_account import ServiceAccountCredentials


#@st.cache_data(show_spinner=False)
def connect_to_google_sheets_data(worksheet_name):
    
    secrets = toml.load(".streamlit/secrets.toml")
    
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(secrets['google_sheets'], scope)
    
    # Authenticate and access the Google Sheets API
    gc = gspread.authorize(credentials)
    
    # Load the Google Sheets data
    spreadsheet_url = secrets['google_sheets']['spreadsheet']
    sheet = gc.open_by_url(spreadsheet_url).worksheet(worksheet_name)
    return sheet
    
def load_sheets_data(sheet, worksheet_name):
    sheet = st.session_state["sheet"].worksheet(worksheet_name)
    data = sheet.get_all_values()
    
    # Convert the data to a DataFrame
    df = pd.DataFrame(data[1:], columns=data[0])
    return df.loc[::-1]
    
def insert_row_to_sheet(sheet, row):
    
    sheet.append_row(row)
    
    