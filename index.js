import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"Book Hub",
  password:"123456",
  port:5432
});

db.connect();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

let books = [
    { id: 1, title: "The Particular Sadness of Lemon Cake by Aimee Bender", isbn:"9780385533225", rating: 9.5, review:"The Particular Sadness of Lemon Cake by Aimee Bender is a poignant novel that explores the complexities of family and personal identity through the lens of magical realism. The story follows Rose Edelstein, a young girl who discovers she can taste the emotions of the person who made her food, beginning with her mother's lemon cake imbued with deep sadness. This unique ability forces Rose to confront the hidden emotional lives of her family members,Bender's lyrical prose and imaginative premise offer a compelling exploration of emotional isolation, connection, and self-discovery. Though the book received mixed reviews for its plot resolution, it is celebrated for its rich character development and emotional depth.revealing layers of secrecy and personal struggles.",   
      reviewDate:'2024-07-30'
    },

    { id: 2, title: "The Particular Sadness of Lemon Cake by Aimee Bender", isbn:"0385472579", rating: 9.5, review:"The Particular Sadness of Lemon Cake by Aimee Bender is a poignant novel that explores the complexities of family and personal identity through the lens of magical realism. The story follows Rose Edelstein, a young girl who discovers she can taste the emotions of the person who made her food, beginning with her mother's lemon cake imbued with deep sadness. This unique ability forces Rose to confront the hidden emotional lives of her family members,Bender's lyrical prose and imaginative premise offer a compelling exploration of emotional isolation, connection, and self-discovery. Though the book received mixed reviews for its plot resolution, it is celebrated for its rich character development and emotional depth.revealing layers of secrecy and personal struggles.",   
        reviewDate:'2024-07-30'
      }
  ];

  

app.get("/", async(req, res)=>{
   const result = await db.query("select * from books");
   books = result.rows;
   
    res.render("index.ejs", {
      listItems:books,

    });
})

app.get("/new", (req, res)=>{
    res.render("addBook.ejs");
})

app.get("/back", (req, res)=>{
    res.render("index.ejs", {
        listItems:books
    });
})

app.get("/viewReview/:id", (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find(b => b.id === bookId);

    if (book) {
      res.render("viewReview.ejs", { book });
    } else {
      res.status(404).send("Book not found");
    }
});

app.get("/detail/:id", (req, res)=>{
  const bookId = parseInt(req.params.id);
  const book = books.find(b => b.id === bookId);

  if(book){
    res.render("searchDetails.ejs", {book});
  } else {
    res.status(404).send("Book not found");
  }

});

app.post("/addBook", async (req, res)=>{
    const inputTitle = req.body.title;
    const inputIsbn = req.body.isbn;
    const inputRating = req.body.rating;
    const inputReview = req.body.review;
    const inputDate = req.body.date;
  await db.query("insert into books (title, isbn, rating, review, reviewdate) values($1, $2, $3, $4, $5);",[inputTitle, inputIsbn, inputRating, inputReview, inputDate]);

  res.redirect("/");
});

app.post("/edit", async(req, res)=>{
  const bookId = req.body.bookid;
  const updatedReview = req.body.updatedReview;
  await db.query("update books set review = $1 where id=$2;",[updatedReview, bookId]);

  res.redirect("/");
});

app.get("/suggest", async(req, res)=>{
  const searchTerm = req.query.q;  // Get the search term from the query string
  console.log(searchTerm);
  try {
    const results = await db.query(
      'SELECT title, isbn, id FROM books WHERE title ILIKE $1 LIMIT 10',
      [`%${searchTerm}%`]
    );
    res.json(results.rows);  // Send the matching results as JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Error querying database');
  }

});

app.post("/sort-criteria", async(req, res)=>{
  const criteria = req.body.criteria;
  console.log(criteria);
  const result = await db.query(`select * from books order by ${criteria} asc`);
  books = result.rows;
  res.render("index.ejs",{
    listItems: books
  }); 
  
})


app.listen(port, ()=>{
    console.log("sever running on port 3000");
})