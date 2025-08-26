import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectedRoute from "../middleware/route.middleware.js";


const router = express.Router();

//creating a book

router.post('/check',async (req,res)=>{
    res.send("Books API endpoint")
})
router.post('/',protectedRoute,async (req,res)=>{
    try {
        const { title,caption,rating,image } = req.body;

        if(!title || !caption || !rating || !image) return res.status(400).json({message:"All fields are required "});

        // upload the image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(image)
        const imageUrl = imageUpload.secure_url;

        // console.log("imageUrl", imageUrl);

        const newBook = await new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user:req.user._id
        });

        await newBook.save();
        res.status(200).json(newBook);

        res.send({message:"Book Added"});

    }catch(error){
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
})

router.get('/',protectedRoute,async (req,res)=>{
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user","username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        })
    } catch (error){
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/user',protectedRoute,async (req,res)=>{
    try{
        const {user} = req.user._id;
        const books = await Book.find({user}).sort({ createdAt: -1 })

        res.json(books);

    }catch (errors){
        console.error("Get user books error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
})

router.delete("/:id",protectedRoute,async (req,res)=>{
    try {

        const book = await  Book.findById(req.params.id);

        if(!book) return res.status(404).send({message:"Book not found"});

        //check is the user is the creator of that book
        if( book.user.toString() !== req.user._id.toString()){
            return res.status(401).send({message:"Unauthorized"});
        }

        // delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);

            }catch(deleteError){
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }

        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    }catch (error){
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export  default router;