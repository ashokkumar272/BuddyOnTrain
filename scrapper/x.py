from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time

def scrape_irctc_trains(from_station, to_station, date):
    # Setup Chrome options
    chrome_options = Options()
    # Uncomment the line below if you want to run headless
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    # Speed up page loading
    chrome_options.page_load_strategy = 'eager'  # Don't wait for all resources to finish loading
    chrome_options.add_argument('--blink-settings=imagesEnabled=false')  # Disable images
    chrome_options.add_argument('--disable-extensions')  # Disable extensions
    
    # Initialize the Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.maximize_window()
    
    # Create two wait objects - a shorter one for critical elements and a longer one for optional elements
    short_wait = WebDriverWait(driver, 10)  # Shorter timeout for critical elements
    wait = WebDriverWait(driver, 20)  # Longer timeout for less critical elements
    train_list = []
    try:
        # Navigate to IRCTC website
        print("Navigating to IRCTC website...")
        driver.get("https://www.irctc.co.in/nget/train-search")
        
        # Wait for the critical elements to be ready - the from station input field
        print("Waiting for page to become interactive...")
        from_input_locator = (By.CSS_SELECTOR, "p-autocomplete[formcontrolname='origin'] input.ui-autocomplete-input")
        short_wait.until(EC.presence_of_element_located(from_input_locator))
        
        # Handle any initial popups/alerts if they appear immediately
        try:
            alert_close = short_wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'OK')]")))
            alert_close.click()
            print("Closed initial alert")
        except:
            print("No initial alert found or it was already closed.")
        
        # Fill From station
        print(f"Entering from station: {from_station}")
        from_input = short_wait.until(EC.element_to_be_clickable(from_input_locator))
        from_input.clear()
        from_input.send_keys(from_station)
        
        # Wait for dropdown to appear
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".ui-autocomplete-panel .ui-autocomplete-items")))
        from_input.send_keys(Keys.DOWN)
        from_input.send_keys(Keys.ENTER)
        
        # Verify the selection was made before proceeding
        wait.until(lambda d: from_input.get_attribute('value') != from_station)
        
        # Fill To station
        print(f"Entering to station: {to_station}")
        to_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "p-autocomplete[formcontrolname='destination'] input.ui-autocomplete-input")))
        to_input.clear()
        to_input.send_keys(to_station)
        
        # Wait for dropdown to appear
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".ui-autocomplete-panel .ui-autocomplete-items")))
        to_input.send_keys(Keys.DOWN)
        to_input.send_keys(Keys.ENTER)
        
        # Verify the selection was made
        wait.until(lambda d: to_input.get_attribute('value') != to_station)
        
        # Fill Date
        print(f"Entering date: {date}")
        date_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "span.ui-calendar > input.ui-inputtext")))
        date_input.clear()
        driver.execute_script("arguments[0].value = arguments[1]", date_input, date)
        
        # Click outside to close date picker if it appears
        driver.find_element(By.TAG_NAME, 'body').click()
        
        # Click Search button
        print("Clicking search button...")
        search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.search_btn.train_Search")))
        search_button.click()
        
        # Wait for search results to load - wait for specific elements instead of fixed sleep
        print("Waiting for search results...")
        train_container = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 
            "div.form-group.no-pad.col-xs-12.bull-back.border-all")))
        
        # Extract train names and numbers
        train_elements = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, 
            "div.form-group.no-pad.col-xs-12.bull-back.border-all > app-train-avl-enq > div.ng-star-inserted > div.dull-back.no-pad.col-xs-12 > div.col-sm-5.col-xs-11.train-heading > strong")))
        
        if len(train_elements) == 0:
            print("No trains found or selector might have changed.")
        
        # Extract train names and numbers into dictionary
        for train_element in train_elements:
            try:
                train_info = train_element.text.strip()
                train_dict = {
                    'name': '',
                    'number': ''
                }
                
                # Parse train name and number
                if '(' in train_info and ')' in train_info:
                    train_dict['name'], train_dict['number'] = train_info.split('(')
                    train_dict['number'] = train_dict['number'][:-1]  # Remove closing parenthesis
                    train_dict['name'] = train_dict['name'].strip()  # Remove any trailing spaces
                else:
                    train_dict['name'] = train_info  # If no number is available
                
                train_list.append(train_dict)
            except Exception as e:
                print(f"Could not extract train information: {e}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    
    finally:
        # Close the browser
        print("Closing browser...")
        driver.quit()
    
    # Return the list of train dictionaries
    return train_list

if __name__ == "__main__":
    # Example usage
    from_station = "vijaywada"  # Change these to your desired stations
    to_station = "delhi"
    date = "12/05/2025"  # Format: DD-MM-YYYY
    
    trains = scrape_irctc_trains(from_station, to_station, date)
    print("\nTrain data:")
    for train in trains:
        print(train)