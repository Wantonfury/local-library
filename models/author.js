const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
});

AuthorSchema.virtual("name").get(function () {
    let full_name = "";
    
    if (this.first_name || this.family_name) {
        if (this.family_name) full_name = this.family_name;
        if (this.first_name) full_name += (full_name !== "" ? ", " : "") + this.first_name;
    }
    
    return full_name;
});

AuthorSchema.virtual("url").get(function () {
    return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual("dates").get(function () {
    let dob = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : 'N/A';
    let dod = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : 'N/A';
    
    return dob + ' - ' + dod;
});

AuthorSchema.virtual("date_of_birth_ymd").get(function () {
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
});

AuthorSchema.virtual("date_of_death_ymd").get(function () {
    return DateTime.fromJSDate(this.date_of_death).toISODate();
});

module.exports = mongoose.model("Author", AuthorSchema);