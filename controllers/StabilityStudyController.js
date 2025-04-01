const StabilityStudy = require('../models/StabilityStudy');
const _ = require('lodash');

exports.createStudy = async (req, res) => {
    const { 
        product, 
        lot, 
        nature, 
        startDate, 
        responsible, 
        approved,
        conditions,
        comments 
    } = req.body;

    try {
        const newStudy = new StabilityStudy({
            product,
            lot,
            nature,
            startDate,
            responsible,
            approved,
            conditions,
            comments: new Map(comments ? Object.entries(comments) : [])  // Sempre inicializa como um Map vazio se não houver comentários
        });

        const study = await newStudy.save();
        res.json(study);
    } catch (err) {
        console.error('Erro ao criar estudo:', err);
        res.status(500).json({
            error: 'Erro ao criar estudo',
            details: err.message
        });
    }
};

//GET
exports.getAllStudies = async (req, res) => {
    try {
        const studies = await StabilityStudy.find();
        res.json(studies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};


//GET BY ID
exports.getStudyById = async (req, res) => {
    try {
        const study = await StabilityStudy.findById(req.params.id);
        if (!study) {
            return res.status(404).json({ msg: 'Estudo não encontrado' });
        }
        res.json(study);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};

//UPDATE
exports.updateStudy = async (req, res) => {
    const { conditions, comments, approved, responsible, newComments } = req.body;

    try {
        const study = await StabilityStudy.findById(req.params.id);
        if (!study) {
            return res.status(404).json({ msg: 'Estudo não encontrado' });
        }

        // Inicializar o Map de comentários se não existir
        if (!study.comments) {
            study.comments = new Map();
        }

        // Atualizar condições
        if (conditions && typeof conditions === 'object') {
            _.merge(study.conditions, conditions);
        }

        // Atualizar comentários existentes
        if (comments && typeof comments === 'object') {
            Object.entries(comments).forEach(([key, value]) => {
                if (study.comments.has(key)) {
                    study.comments.set(key, {
                        ...study.comments.get(key),
                        ...value,
                        updatedAt: new Date()
                    });
                }
            });
        }

        // Adicionar novos comentários
        if (newComments && Array.isArray(newComments)) {
            newComments.forEach(comment => {
                const uniqueKey = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                study.comments.set(uniqueKey, {
                    ...comment,
                    createdAt: new Date()
                });
            });
        }

        // Atualizar approved e responsible
        if (typeof approved === 'boolean') {
            study.approved = approved;
        }

        if (responsible && typeof responsible === 'string') {
            study.responsible = responsible;
        }

        const updatedStudy = await study.save();
        res.json(updatedStudy);
    } catch (err) {
        console.error('Erro ao atualizar estudo:', err);
        res.status(500).json({
            error: 'Erro ao atualizar estudo',
            details: err.message
        });
    }
};

//DELETE
exports.deleteStudy = async (req, res) => {
    try {
        const study = await StabilityStudy.findById(req.params.id);
        if (!study) {
            return res.status(404).json({ msg: 'Estudo não encontrado' });
        }

        await study.deleteOne();
        res.json({ msg: 'Estudo removido' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};
