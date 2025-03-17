const fs = require('fs');
const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;


const DATA_FILE = 'books.json'
let books = [];
const studentNumber =[{ studentNumber: 2559026}];


app.get('/whoami', (req,res) =>{
    res.send(studentNumber);
})

if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    books = JSON.parse(data);
}

function saveBooksToFile() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
}
app.get('/books', (req, res)=>{
    res.send(books);
});

app.get('/books/:id',  (req, res) =>{
    const book = books.find(c => c.id  === parseInt(req.params.id));
    if (!book){
        return res.status(404).send('Not found');
    }
});

app.post('/books', (req, res) =>{
    const { error } = validateBook(req.body);
    if (error){
        return res.status(400).send('Missing required details');
    }

    const book = {
        id : books.length > 0 ? books[books.length - 1].id + 1 : 1,
        title : req.body.title,
        details: req.body.details.map((d, index) => ({
            id: index + 1, 
            author: d.author,
            genre: d.genre,
            publicationYear: parseInt(d.publicationYear)
        }))
    }

    books.push(book);
    saveBooksToFile();
    res.send(book)

});

app.post('/books/:id/details', (req, res) =>{
    const book = books.find(c => c.id  === parseInt(req.params.id));
    if (!book){
        return res.status(404).send('missing or invalid feilds');
    }

    const { error } = validateBook(req.body);
    if (error){
        return res.status(400).send(error.details[0].message);
    }


    const ndetails = {
        id : books.length > 0 ? books[books.length - 1].id + 1 : 1,
        author : req.body.author,
        genre : req.body.genre,
        publicationYear: parseInt(req.body.publicationYear)
    }
    book.details.push(ndetails);
    saveBooksToFile(); 
    res.send(ndetails);

});




app.put('/books/:id', (req, res) => {
    const book  = books.find(c => c.id === parseInt(req.params.id));
    if (!book){
        return res.status(404).send('Not Found');
    }


    const { error } = validateCar(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    book.title = req.body.title;
    book.details = req.body.details.map((d, index) => ({
        id: index + 1, 
        author: d.author,
        genre: d.genre,
        publicationYear: parseInt(d.publicationYear)
    }));

    saveBooksToFile();
    res.send(book);
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) {
        return res.status(404).send('Book not found');
    }

    const deletedBook = books.splice(bookIndex, 1)[0]; 
    saveBooksToFile(); 
    res.send(deletedBook);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.delete('/books/:id/details /:detailId', (req, res) =>{
    const book = books.find(c => c.id  === parseInt(req.params.id));
        if (!book){
            return res.status(404).send('Wrong ID cuz');
        }

    const idetail = book.details.findIndex(e => e.id === parseInt(detailId));
    if (idetail === -1){
        return res.status(404).send('Detail not found');
    }

    const dDetail = book.details.splice(idetail, 1)[0];
    saveBooksToFile();
    res.send(dDetail);


});



function validateBook(book){
    const schema = Joi.object({
        title : Joi.string().min(2).required(),
        details: Joi.array().items(
            Joi.object({
                author: Joi.string().required(),
                genre: Joi.string().required(),
                publicationYear : Joi.number().integer().min(1886).max(new Date().getFullYear()).required()
            })
        ).required()
    });
    return schema.validate(book);
}
 

