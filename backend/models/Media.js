const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    hash: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    ipfsHash: {
        type: String,
        default: null
    },
    metadata: {
        type: Object,
        default: {}
    },
    nftTokenId: {
        type: Number,
        default: null,
        unique: true,
        sparse: true
    },
    owner: {
        type: String,
        required: true
    },
    blockchainTxHash: {
        type: String,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['image', 'video', 'audio', 'document', 'other'],
        default: 'other'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for file size in human readable format
MediaSchema.virtual('formattedSize').get(function() {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Index for search
MediaSchema.index({ 
    originalName: 'text', 
    'metadata.description': 'text',
    tags: 'text'
});

// Pre-save middleware to set category based on mimeType
MediaSchema.pre('save', function(next) {
    if (this.mimeType) {
        if (this.mimeType.startsWith('image/')) {
            this.category = 'image';
        } else if (this.mimeType.startsWith('video/')) {
            this.category = 'video';
        } else if (this.mimeType.startsWith('audio/')) {
            this.category = 'audio';
        } else if (this.mimeType.includes('pdf') || this.mimeType.includes('document')) {
            this.category = 'document';
        }
    }
    next();
});

// Static method to find by hash
MediaSchema.statics.findByHash = function(hash) {
    return this.findOne({ hash });
};

// Instance method to increment view count
MediaSchema.methods.incrementViews = async function() {
    this.views += 1;
    return await this.save();
};

// Instance method to increment download count
MediaSchema.methods.incrementDownloads = async function() {
    this.downloads += 1;
    return await this.save();
};

module.exports = mongoose.model('Media', MediaSchema);
