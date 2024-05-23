import streamlit as st





# Code for page motives
def display_page_recipe():
    
    text_1 = """Our Conspiracy Generator follows a simple recipe. You can find the details in this [academic paper](https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/views) or this [blog post](https://maartenboudry.substack.com/p/the-conspiracy-generator). You can also try out our recipe for yourself, without the aid of artificial intelligence. Here it is:"""
    text_2 = """
* **Hunt for anomalies**: Look for puzzling details, anomalies or contradictions in the official story, which “proves” that it must be false. You’re “just asking questions” at this point. Since no explanation of any event is ever complete, this will be easy.
* **Connect the dots**: Now you fabricate some “evidence” that implicates your culprit and reveal their evil schemes. Try to be creative and forge some suspicious connections between the story and your culprits. 
* **Dismiss counterevidence**: Spin a story suggesting that evidence is missing because the conspirators have been covering up their tracks. Likewise, apparent counterevidence could be planted by the conspirators to throw courageous truth-seekers such as yourself off the scent. Didn’t we tell you they are very devious?  
* **Discredit critics**: Pesky critics of your conspiracy theory can be dealt with in various ways: you can say that they are gullible dupes of official propaganda, that they have been manipulated, or that they are even complicit in the plot, being paid stooges of the conspirators.
"""

    st.markdown(text_1)
    st.markdown(text_2)
