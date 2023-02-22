const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    imprint: { type: String, required: true },
    status: { 
        type: String,
        required: true,
        enum: ["Available", "Maintenance", "Loaned", "Reserved"],
        default: "Maintenance"
    },
    due_date: { type: Date, default: Date.now }
});

BookInstanceSchema.virtual("url").get(function () {
    return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual("due_date_formatted").get(function () {
    return DateTime.fromJSDate(this.due_date).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual('due_date_ymd').get(function () {
    return DateTime.fromJSDate(this.due_date).toISODate();
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);