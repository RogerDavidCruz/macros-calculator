# Macronutrients Calculator
  - CRUD and Authentication
  - Application to calculate your macro nutrients based on your fitness goal.
  - Allow daily counting macro posts of meals with pictures of your meal

---

# Install

`npm install`

---

# Things to add

- Create a `.env` file and add the following as `key = value`
  - PORT = 9090 (can be any port example: 3001)
  - DB_STRING = `your database URI`
  - CLOUD_NAME = `your cloudinary cloud name`
  - API_KEY = `your cloudinary api key`
  - API_SECRET = `your cloudinary api secret`

---

# Run

`npm start`

---

# MVP

  - C - (CREATE) ----> /POST: A logged in user can create post with their macro details
  - R - (READ) -------> /GET: Retrieving all macro posts from respective users
  - U - (UPDATE) -----> /PUT: Can update servings amount increasing or decreasing
  - D - (DELETE) --> /DELETE: Delete the post created containing macro details

---

# Second Version

  - R - (READ) ----> /GET: Use D3 JS to create graphs of the data collected
  
---

# Break Down on How it is calculated

- Using the Mifflin-St. Jeor equation (Option 1)
    1. Figure out your calorie needs (TDEE) (Calories/day)
    2. Decide your ideal macronutrient breakdown (example: 40% carb, 30% protein, 30% fat)
    3. Multiply percentage by TDEE and divide by 4 cal/g (carbs), 4 cal/g (protein), 9 cal/g (fats) respectively

- Using the Harris-Benedict Equation (Option 2)
    1. BMR x activity level = Your daily amount of Calories (DAC)
    2. Then choose your macro split (example: 40% carb, 40% protein, 20% fat)
    3. Result in daily grams of Protein, Carbohydrates, and Fat
