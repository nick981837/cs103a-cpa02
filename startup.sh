#!/bin/bash
export mongodb_URI='mongodb+srv://admin:12345@cluster0.gppo4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
echo "connecting to $mongodb_URI"
nodemon