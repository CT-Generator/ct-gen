import openai

# Moderation endpoint
def moderate_text(text, api_key=None):
    try:
        if api_key is None:
            from ct_gen.src.modules.authentication import load_secrets
            secrets = load_secrets()
            api_key = secrets["openai"]["api_key"]
        
        # Set the API key
        openai.api_key = api_key
            
        response = openai.Moderation.create(
            input=text
        )
        
        if response.results[0].flagged:
            return False, "Content is not appropriate."
        return True, "Content is appropriate."

    except Exception as e:
        print(f"Error in moderation: {str(e)}")
        return False, "Failed to moderate content."
