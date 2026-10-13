const mongoose = require('mongoose');
const Material = require('../models/Material');
const Classroom = require('../models/Classroom');
const mockStore = require('../utils/mockStore');

const isDBConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Get materials for a classroom
// @route   GET /api/materials?classroomId=xxx
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const { classroomId } = req.query;

    if (!isDBConnected()) {
      let list = mockStore.materials;
      if (classroomId) {
        list = list.filter((m) => (m.classroomId?._id || m.classroomId) === classroomId);
      }
      return res.status(200).json({ success: true, count: list.length, materials: list, data: list });
    }

    let query = {};
    if (classroomId) query.classroomId = classroomId;

    const materials = await Material.find(query)
      .populate('uploadedBy', 'name profileImage')
      .populate('classroomId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: materials.length, materials, data: materials });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload material
// @route   POST /api/materials
// @access  Private (teacher)
const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, classroomId } = req.body;

    if (!isDBConnected()) {
      const cr = mockStore.classrooms.find((c) => c._id === classroomId);
      const newMat = {
        _id: 'mat_' + Date.now(),
        title,
        description,
        classroomId: cr ? { _id: cr._id, title: cr.title } : classroomId,
        fileUrl: req.file ? req.file.path || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: req.file?.mimetype ? (req.file.mimetype.includes('pdf') ? 'PDF' : 'DOC') : 'PDF',
        uploadedBy: req.user.id,
        createdAt: new Date().toISOString(),
      };
      mockStore.materials.unshift(newMat);
      return res.status(201).json({ success: true, material: newMat, data: newMat });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const material = await Material.create({
      title,
      description,
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      classroomId,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, material, data: material });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (teacher)
const deleteMaterial = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      mockStore.materials = mockStore.materials.filter((m) => m._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Material deleted' });
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await Material.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMaterials, uploadMaterial, deleteMaterial };
