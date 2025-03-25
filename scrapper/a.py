from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import time
from bs4 import BeautifulSoup
import json
import traceback

def scrape_trains(origin, destination, date):
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Runs Chrome in headless mode (no GUI)
    chrome_options.add_argument("--disable-gpu")  # Disable GPU acceleration
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36")

    # Create a WebDriver instance using webdriver_manager
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Navigate to the target URL
        driver.get('https://www.ixigo.com/trains')
        print("Navigated to ixigo.com/trains")
        
        # Let the page load completely
        time.sleep(5)  # Increased wait time for initial page load
        
        # Take a screenshot for debugging
        driver.save_screenshot("ixigo_initial.png")
        print("Saved initial screenshot")
        
        # Wait for the page to load with longer timeout
        wait = WebDriverWait(driver, 300)
        
        # Use the exact selectors provided
        try:
            print("Looking for origin input...")
            # Find origin input using data-testid and placeholder
            origin_input = wait.until(EC.element_to_be_clickable((
                By.XPATH, "//input[@data-testid='autocompleter-input' and @placeholder='Enter Origin']"
            )))
            
            print("Found origin input field")
            
            # More reliable interaction
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", origin_input)
            time.sleep(2)
            
            # Try to dismiss any popups or overlays
            try:
                # Click somewhere safe to dismiss potential overlays
                driver.execute_script("document.body.click();")
                time.sleep(1)
            except:
                pass
                
            # Use JavaScript to focus and clear the field
            driver.execute_script("arguments[0].focus(); arguments[0].value = '';", origin_input)
            time.sleep(1)
            
            # Use JavaScript to set the value and trigger events
            driver.execute_script(f"arguments[0].value = '{origin}'; " +
                                "arguments[0].dispatchEvent(new Event('input')); " +
                                "arguments[0].dispatchEvent(new Event('change'));", origin_input)
            
            print(f"Entered origin: {origin}")
            time.sleep(3)  # Increased wait time for autocomplete
            
            # Wait for and select first autocomplete suggestion using keyboard navigation
            try:
                # Use ActionChains for more reliable keyboard interaction
                actions = ActionChains(driver)
                actions.send_keys(Keys.ARROW_DOWN).pause(1).send_keys(Keys.ENTER).perform()
                print("Selected first suggestion for origin using keyboard navigation")
                time.sleep(2)  # Wait after selection
            except Exception as e:
                print(f"Error selecting autocomplete suggestion: {str(e)}")
                print("Continuing anyway...")
            
            # Find destination input using data-testid and placeholder
            print("Looking for destination input...")
            destination_input = wait.until(EC.presence_of_element_located((
                By.XPATH, "//input[@data-testid='autocompleter-input' and @placeholder='Enter Destination']"
            )))
            
            print("Found destination input field")
            
            # Take screenshot before destination interaction
            driver.save_screenshot("before_destination.png")
            
            # More careful interaction with destination field
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", destination_input)
            time.sleep(2)
            
            # Use JavaScript to bypass the click interception
            driver.execute_script("arguments[0].focus(); arguments[0].value = '';", destination_input)
            time.sleep(1)
            
            # Use JavaScript to set the value directly and trigger events
            driver.execute_script(f"arguments[0].value = '{destination}'; " +
                                "arguments[0].dispatchEvent(new Event('input')); " +
                                "arguments[0].dispatchEvent(new Event('change'));", destination_input)
            
            print(f"Entered destination: {destination}")
            time.sleep(3)  # Increased wait time for autocomplete
            
            # Take screenshot after entering destination
            driver.save_screenshot("after_destination_entry.png")
            
            # Wait for and select first autocomplete suggestion using keyboard navigation
            try:
                # Use ActionChains for more reliable keyboard interaction
                actions = ActionChains(driver)
                actions.send_keys(Keys.ARROW_DOWN).pause(1).send_keys(Keys.ENTER).perform()
                print("Selected first suggestion for destination using keyboard navigation")
                time.sleep(2)  # Wait after selection
            except Exception as e:
                print(f"Error selecting destination autocomplete: {str(e)}")
                print("Continuing anyway...")
            
            # Find and click the date selector (calendar)
            print("Looking for date input...")
            
            # Try to find the date container element
            try:
                date_container = wait.until(EC.presence_of_element_located((
                    By.XPATH, "//div[@data-testid='search-form-calendar']/span"
                )))
                
                # Use JavaScript to click the date container
                driver.execute_script("arguments[0].click();", date_container)
                print("Clicked date selector")
                
                # Wait for the calendar to appear
                time.sleep(2)
                
                # Take a screenshot of the calendar
                driver.save_screenshot("calendar.png")
                
                # Parse the date format DD/MM/YYYY
                date_parts = date.split("/")
                target_day = int(date_parts[0])
                target_month = int(date_parts[1])
                target_year = int(date_parts[2])
                
                print(f"Trying to select date: day={target_day}, month={target_month}, year={target_year}")
                
                # Format target date in the format used by data-date attribute (DDMMYYYY)
                target_date_attr = f"{target_day:02d}{target_month:02d}{target_year}"
                print(f"Looking for date with data-date attribute: {target_date_attr}")
                
                # Wait for the calendar to be fully loaded
                try:
                    # Check if calendar container is present with the specific class
                    calendar_container = wait.until(EC.presence_of_element_located((
                        By.XPATH, "//div[contains(@class, 'rd-container') and contains(@class, 'train-cal')]"
                    )))
                    print("Found calendar container")
                    
                    # Check current month/year displayed
                    month_label = driver.find_element(By.XPATH, "//div[contains(@class, 'rd-month-label')]")
                    if month_label:
                        print(f"Current month/year displayed: {month_label.text}")
                    
                    # Try to find the specific date using the data-date attribute (most reliable)
                    try:
                        # Look for an enabled date cell with matching data-date
                        target_date_cell = driver.find_element(By.XPATH, 
                            f"//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled')) and @data-date='{target_date_attr}']"
                        )
                        print(f"Found exact target date cell with data-date={target_date_attr}")
                        driver.execute_script("arguments[0].click();", target_date_cell)
                        print(f"Clicked on exact target date: {date}")
                    except Exception as specific_date_err:
                        print(f"Could not find exact target date: {str(specific_date_err)}")
                        
                        # If we can't find the exact date, try navigation if needed
                        # First check if we need to navigate forward
                        try:
                            # Find the next month button
                            next_month_button = driver.find_element(By.XPATH, 
                                "//button[contains(@class, 'rd-next') or contains(@class, 'ixi-icon-arrow')]"
                            )
                            
                            if next_month_button:
                                print("Found next month button, will try navigation")
                                
                                # Navigate month by month until we find our target date or reach a limit
                                date_found = False
                                for i in range(12):  # Maximum 12 months forward
                                    # First check if current month contains our target date
                                    current_month_text = driver.find_element(By.XPATH, "//div[contains(@class, 'rd-month-label')]").text
                                    print(f"Current month/year: {current_month_text}")
                                    
                                    # Try to find our date in the current month view
                                    try:
                                        # Check for the specific day in current month
                                        day_cells = driver.find_elements(By.XPATH, 
                                            f"//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled'))]"
                                        )
                                        
                                        # Look through all enabled day cells
                                        for day_cell in day_cells:
                                            day_date_attr = day_cell.get_attribute("data-date")
                                            if day_date_attr:
                                                # Check if this is our target date
                                                print(f"Checking date cell with data-date={day_date_attr}")
                                                if day_date_attr == target_date_attr:
                                                    driver.execute_script("arguments[0].click();", day_cell)
                                                    print(f"Found and clicked target date after navigation")
                                                    date_found = True
                                                    break
                                            
                                            # Alternative check by day number text
                                            day_text = day_cell.text.strip()
                                            if day_text and day_text.isdigit() and int(day_text) == target_day:
                                                driver.execute_script("arguments[0].click();", day_cell)
                                                print(f"Found and clicked day {target_day} by text")
                                                date_found = True
                                                break
                                        
                                        if date_found:
                                            break
                                    except Exception as day_err:
                                        print(f"Error finding day in current month: {str(day_err)}")
                                    
                                    # If date not found, click next month
                                    if not date_found:
                                        driver.execute_script("arguments[0].click();", next_month_button)
                                        print("Navigated to next month")
                                        time.sleep(1)
                                        
                                        # Take screenshot after navigation
                                        driver.save_screenshot(f"calendar_nav_{i}.png")
                                    else:
                                        break
                                
                                if not date_found:
                                    print("Could not find target date after navigating through months")
                                    # Fall back to selecting any enabled date
                                    enabled_dates = driver.find_elements(By.XPATH, 
                                        "//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled'))]"
                                    )
                                    if enabled_dates:
                                        # Select the first enabled date
                                        driver.execute_script("arguments[0].click();", enabled_dates[0])
                                        selected_date = enabled_dates[0].get_attribute("data-date")
                                        print(f"Selected fallback date with data-date={selected_date}")
                            else:
                                print("No next month button found")
                                # Try to select any enabled date in current month
                                enabled_dates = driver.find_elements(By.XPATH, 
                                    "//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled'))]"
                                )
                                if enabled_dates:
                                    driver.execute_script("arguments[0].click();", enabled_dates[0])
                                    print(f"Selected first available date as fallback")
                        except Exception as nav_err:
                            print(f"Error during calendar navigation: {str(nav_err)}")
                            # Last resort - try clicking any enabled date
                            try:
                                enabled_dates = driver.find_elements(By.XPATH, 
                                    "//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled'))]"
                                )
                                if enabled_dates:
                                    driver.execute_script("arguments[0].click();", enabled_dates[0])
                                    print("Selected first available date as fallback")
                            except:
                                print("Failed to select any date from calendar")
                
                except Exception as cal_err:
                    print(f"Error with calendar interaction: {str(cal_err)}")
                    traceback.print_exc()
                    # Try one last approach - try clicking any valid date
                    try:
                        # Look specifically for td elements with the rd-day-body class that are not disabled
                        valid_dates = driver.find_elements(By.XPATH, "//td[contains(@class, 'rd-day-body') and not(contains(@class, 'rd-day-disabled'))]")
                        if valid_dates:
                            driver.execute_script("arguments[0].click();", valid_dates[0])
                            print(f"Clicked a fallback date using final approach")
                        else:
                            # Just close the calendar and continue
                            driver.find_element(By.XPATH, "//body").click()
                            print("Closed calendar without selecting a date")
                    except:
                        # If all else fails, just proceed without a date selection
                        print("Could not interact with calendar at all, continuing without date selection")
                
                # Take a screenshot after date selection
                driver.save_screenshot("after_date_selection.png")
                
            except Exception as date_error:
                print(f"Error with date selector: {str(date_error)}")
                traceback.print_exc()
                print("Continuing without selecting date...")
            
            # Find and click search button
            print("Looking for search button...")
            try:
                search_button = wait.until(EC.presence_of_element_located((
                    By.XPATH, "//button[@data-testid='book-train-tickets']"
                )))
                
                print("Found search button")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", search_button)
                time.sleep(1)
                
                # Use JavaScript to click the button to avoid any interception issues
                driver.execute_script("arguments[0].click();", search_button)
                print("Clicked search button")
                
                # Take a screenshot after clicking search
                time.sleep(2)
                driver.save_screenshot("after_search_click.png")
                print("Saved screenshot after clicking search")
            except Exception as button_error:
                print(f"Error with search button: {str(button_error)}")
                return []
            
            # Wait for results page to load - longer wait since results may take time
            print("Waiting for results to load...")
            time.sleep(15)  # Increased wait time for results
            
            # Check if we're on results page
            current_url = driver.current_url
            print(f"Current URL: {current_url}")
            
            # Take a final screenshot of results
            driver.save_screenshot("results_page.png")
            print("Saved screenshot of results page")
            
            # Get page source
            html = driver.page_source
            
            # Save HTML for debugging
            with open("page_source.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("Saved page source to page_source.html")
            
            # Parse HTML
            soup = BeautifulSoup(html, 'html.parser')
            
            # Use the exact structure provided by the user
            print("Extracting train information using the provided structure...")
            
            # Find the main container for train listings
            train_listing_container = soup.select_one("div.train-listing-rows")
            
            if not train_listing_container:
                print("Could not find train-listing-rows container")
                print("Looking for any train-related elements...")
                
                # Try to find any train-related elements
                train_elements = soup.select("*[class*='train']")
                print(f"Found {len(train_elements)} elements with 'train' in class name")
                
                # Try a more generic search for span.train-number and span.train-name
                all_train_numbers = soup.select("span.train-number")
                all_train_names = soup.select("span.train-name")
                
                print(f"Found {len(all_train_numbers)} train numbers and {len(all_train_names)} train names directly")
                
                if len(all_train_numbers) > 0 and len(all_train_names) > 0:
                    trains = []
                    # Match them up if counts are equal
                    if len(all_train_numbers) == len(all_train_names):
                        for i in range(len(all_train_numbers)):
                            train_data = {
                                'train_number': all_train_numbers[i].get_text(strip=True),
                                'train_name': all_train_names[i].get_text(strip=True)
                            }
                            trains.append(train_data)
                            print(f"Added train: {train_data['train_number']} - {train_data['train_name']}")
                    return trains
                return []
            
            # Find all train listing items
            train_items = train_listing_container.select("ul > li")
            print(f"Found {len(train_items)} train items")
            
            # Extract train data
            trains = []
            
            for train_item in train_items:
                train_data = {}
                
                # Find train name and number using the exact path
                train_number_elem = train_item.select_one("div.train-listing-row > div.train-data-wrapper > div.u-fb > div.train-info-status > div.name-number > a > span.train-number")
                train_name_elem = train_item.select_one("div.train-listing-row > div.train-data-wrapper > div.u-fb > div.train-info-status > div.name-number > a > span.train-name")
                
                if train_number_elem:
                    train_data['train_number'] = train_number_elem.get_text(strip=True)
                    print(f"Found train number: {train_data['train_number']}")
                
                if train_name_elem:
                    train_data['train_name'] = train_name_elem.get_text(strip=True)
                    print(f"Found train name: {train_data['train_name']}")
                
                # Only add if we found at least some data
                if train_data:
                    trains.append(train_data)
            
            if not trains:
                print("No trains found with the provided structure. Trying alternative approach...")
                
                # Alternative approach: look for any elements with train-number and train-name classes
                all_train_numbers = soup.select("span.train-number")
                all_train_names = soup.select("span.train-name")
                
                print(f"Alternative approach found {len(all_train_numbers)} train numbers and {len(all_train_names)} train names")
                
                # Match them up if counts are equal
                if len(all_train_numbers) == len(all_train_names) and len(all_train_numbers) > 0:
                    for i in range(len(all_train_numbers)):
                        train_data = {
                            'train_number': all_train_numbers[i].get_text(strip=True),
                            'train_name': all_train_names[i].get_text(strip=True)
                        }
                        trains.append(train_data)
                        print(f"Added train: {train_data['train_number']} - {train_data['train_name']}")
            
            return trains
            
        except Exception as input_error:
            print(f"Error during input phase: {str(input_error)}")
            traceback.print_exc()
            driver.save_screenshot("error_screenshot.png")
            print("Saved error screenshot")
            return []
            
    except Exception as e:
        print(f"Error during scraping: {str(e)}")
        traceback.print_exc()
        try:
            driver.save_screenshot("error_screenshot.png")
            print("Saved error screenshot")
        except:
            pass
        return []
    
    finally:
        # Clean up and close the browser
        driver.quit()

if __name__ == "__main__":
    # Example usage
    origin = "Delhi"
    destination = "Mumbai"
    date = "20/03/2025"  # Format: DD/MM/YYYY
    
    print(f"Searching for trains from {origin} to {destination} on {date}")
    trains = scrape_trains(origin, destination, date)
    
    if trains:
        print(f"\nFound {len(trains)} trains:")
        for i, train in enumerate(trains, 1):
            print(f"Train {i}: {train.get('train_number', 'N/A')} - {train.get('train_name', 'N/A')}")
    else:
        print("No trains found or error occurred during scraping.")
