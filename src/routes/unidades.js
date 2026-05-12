const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const unidades = await prisma.unidade.findMany({
      include: {
        // Busca os dados do proprietário relacionado
        proprietario: true, 
        
        // Mantém a busca da última leitura
        leituras: {
          orderBy: { criadoEm: 'desc' },
          take: 1
        }
      }
    });

    // Agora formatamos para enviar um objeto mais rico para o App/Web
    const respostaFormatada = unidades.map(unidade => {
      return {
        id: unidade.id,
        numero: unidade.numero,
        bloco: unidade.bloco,
        
        // Dados da Leitura (como fizemos antes)
        ultimaLeitura: unidade.leituras.length > 0 ? unidade.leituras[0].leituraAtual : 0,
        
        // Dados do Proprietário (objeto completo ou apenas o que você precisar)
        proprietario: {
          id: unidade.proprietario.id,
          nome: unidade.proprietario.nome,
          email: unidade.proprietario.email,
          telefone: unidade.proprietario.telefone
        }
      };
    });

    res.json(respostaFormatada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar unidades com proprietários' });
  }
});

// Criar unidade vinculada a um proprietário
router.post('/', auth, async (req, res) => {
  const { numero, bloco, proprietarioId } = req.body;
  try {
    const unidade = await prisma.unidade.create({
      data: { 
        numero, 
        bloco, 
        proprietarioId: proprietarioId ? parseInt(proprietarioId) : null 
      }
    });
    res.status(201).json(unidade);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar unidade" });
  }
});

// Atualizar unidade
router.put('/:id', auth, async (req, res) => {
  const { numero, bloco, proprietarioId } = req.body;
  try {
    const unidade = await prisma.unidade.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        numero, 
        bloco, 
        proprietarioId: proprietarioId ? parseInt(proprietarioId) : null 
      }
    });
    res.json(unidade);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

// Excluir unidade
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.unidade.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ msg: "Unidade excluída" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir" });
  }
});

module.exports = router;
