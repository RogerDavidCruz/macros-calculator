# Macronutrients Calculator
  - CRUD and Authentication
  - Application to calculate your macro nutrients based on your fitness goal.
  - Allow daily posts of meals with pictures of your meal

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
  