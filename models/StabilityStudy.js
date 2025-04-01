const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const commentSchema = new Schema({
    date: { type: Date, default: Date.now },
    comment: String
});

const conditionSchema = new Schema({
    aspect: String,
    color: String,
    odor: String,
    pH: String,
    viscosity: String,
});

const stabilityStudySchema = new Schema({
    projectNumber: { type: Number, unique: true },
    product: String,
    lot: String,
    nature: String,
    startDate: Date,
    conditions: {
        estufa: {
            day0: conditionSchema,
            day7: conditionSchema,
            day15: conditionSchema,
            day30: conditionSchema,
            day60: conditionSchema,
            day90: conditionSchema
        },
        luz: {
            day0: conditionSchema,
            day7: conditionSchema,
            day15: conditionSchema,
            day30: conditionSchema,
            day60: conditionSchema,
            day90: conditionSchema
        },
        escuro: {
            day0: conditionSchema,
            day7: conditionSchema,
            day15: conditionSchema,
            day30: conditionSchema,
            day60: conditionSchema,
            day90: conditionSchema
        },
        geladeira: {
            day0: conditionSchema,
            day7: conditionSchema,
            day15: conditionSchema,
            day30: conditionSchema,
            day60: conditionSchema,
            day90: conditionSchema
        }
    },
    comments: {
        type: Map,
        of: commentSchema,
        default: new Map()
    },
    approved: Boolean,
    responsible: String
});

stabilityStudySchema.plugin(AutoIncrement, { inc_field: 'projectNumber' });

module.exports = mongoose.model('StabilityStudy', stabilityStudySchema);
