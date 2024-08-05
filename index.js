import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

// express server setup
const app = express();
const port = 3000;
const saltRounds = 10;

// databse setup 

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "ChatApp",
  password: "0923",
  port: 5432,
});

db.connect();

// body-parser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("images"));

// routing setup for homePage
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// routing setup for loginPage
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// routing setup for registerPage
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  
  // getting the data from input fields 

  const name = req.body.Name;
  const username = req.body.email;
  const password = req.body.password;
  
  // checking if the user already exists in our database
  const emailExist = await db.query("SELECT * FROM chatapptable WHERE email = $1", [username]);
 try {
  if(emailExist.rows.length > 0) {
    res.send("email already exists, try another one");
  } else {
  // inserting the data to the database
  // password hashing 💀
     bcrypt.hash(password, saltRounds, async (err, hash) => {
      if(err) {
        console.log("error hashing passwords: ", err);
      } else {

      const result =  await db.query("INSERT INTO chatapptable (name, email, password) VALUES ($1, $2, $3)", [name, username, hash]);
 
      console.log(result);
      } 
    });

  }  
}catch (err) {
  console.log(err);
};

  console.log(username);
  console.log(password);
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const loginPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM chatapptable WHERE email = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
       
      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if(err){
          console.log("error compararing passwords: ", err);
        } else{
          if (result) {
            res.render("chatpage.ejs");
          } else{
            res.send("Incorrect Password");
          }
        }
      });
     
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

