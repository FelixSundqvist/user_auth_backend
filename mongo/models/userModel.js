const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstname: {
        type: String,
        trim: true,
        maxlength: 12,
    },
    lastname: {
        type: String,
        trim: true,
        maxlength: 20,
    },
    username: {
        type: String,
        required: [true, 'Username must be provided'],
        unique: true,
        trim: true,
        maxlength: 20,
        minlength: 3,
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password has to be atleast 6 characters'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Password has to match'],
        validate: {
            //This only works on CREATE AND SAVE!!!!!, not with UPDATE
            validator: function(el) {
                return el === this.password
            },
            message: 'Password not matching',
        },
    },
    email: {
        type: String,
        required: [true, 'User must have a email'],
        unique: [true, 'email already registered'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
    },
    created: {
        type: Date,
    },
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next()
    }
    if (this.password === this.passwordConfirm) {
        this.password = await bcrypt.hash(this.password, 12)
        this.passwordConfirm = undefined
        this.created = Date.now()
    }

    next()
})

const Users = mongoose.model('Users', userSchema)

module.exports = Users
