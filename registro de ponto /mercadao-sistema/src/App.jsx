import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// --- COMPONENTE DA ÁREA DO FUNCIONÁRIO ---
function AreaPonto({ historico, setHistorico }) {
  const [funcionario, setFuncionario] = useState("")
  const [unidade, setUnidade] = useState("Baixa Grande do Ribeiro")
  const [carregando, setCarregando] = useState(false)

  const funcionariosBaixa = ["Andreia", "Jamil", "Jhony", "Fran", "Matheus", "Joao vitor", "Maria"]
  const funcionariosRibeiro = ["Yara", "Vanessa", "Maria jesus", "João Pedro"]

  const listaAtual = unidade === "Baixa Grande do Ribeiro" ? funcionariosBaixa : funcionariosRibeiro

  // 📍 1. COORDENADAS GEOGRÁFICAS DAS SUAS LOJAS
  // IMPORTANTE: Substitua os números abaixo pelas coordenadas exatas do Google Maps quando puder
  const COORDENADAS_LOJAS = {
    "Baixa Grande do Ribeiro": { lat: -7.860946383635714, lng: -45.209921660385916 }, 
    "Ribeiro Gonçalves": { lat: -7.5568, lng: -45.2443 }       
  }

  // 🧮 2. FÓRMULA MATEMÁTICA PARA CALCULAR DISTÂNCIA (HAVERSINE)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Raio da Terra em metros
    const p1 = lat1 * Math.PI / 180
    const p2 = lat2 * Math.PI / 180
    const deltaP = (lat2 - lat1) * Math.PI / 180
    const deltaLon = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Retorna a distância exata em metros
  }

  // 🌐 3. FUNÇÃO DE ENVIO PARA O SHEETDB
  const enviarParaPlanilha = async (dadosPonto) => {
    setCarregando(true)
    try {
      const response = await fetch("https://sheetdb.io/api/v1/zd52cp7oqvbda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [dadosPonto] })
      })
      if (!response.ok) {
        console.error("Erro ao gravar na planilha.")
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
    } finally {
      setCarregando(false)
    }
  }

  // 🔒 4. FUNÇÃO BATER PONTO COM VALIDAÇÃO DE GPS
  const baterPonto = (tipo) => {
    if (!funcionario) return alert("Selecione um funcionário!")
    if (carregando) return

    if (!navigator.geolocation) {
      return alert("Seu navegador ou celular não suporta geolocalização.")
    }

    setCarregando(true) // Ativa o estado de carregamento enquanto busca o GPS

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latUsuario = position.coords.latitude
        const lngUsuario = position.coords.longitude
        const coordenadaLoja = COORDENADAS_LOJAS[unidade]

        // Calcula a distância real em metros
        const distancia = calcularDistancia(
          latUsuario, 
          lngUsuario, 
          coordenadaLoja.lat, 
          coordenadaLoja.lng
        )

        const RAIO_MAXIMO = 50 // Define o limite máximo de 50 metros de distância da loja

        // Se o funcionário estiver além do limite de segurança, barra o ponto na hora
        if (distancia > RAIO_MAXIMO) {
          setCarregando(false)
          return alert(`Erro de Localização: Você está a ${Math.round(distancia)} metros da loja. O ponto só pode ser batido dentro do Mercadão das Frutas!`)
        }

        const agora = new Date()
const novoRegistro = {
  nome: funcionario,
  tipo: tipo,
  unidade: unidade,
  horario: agora.toLocaleTimeString("pt-BR"),
  data: agora.toLocaleDateString("pt-BR"),
  validado: "Pendente",
  observacao: `GPS OK (${Math.round(distancia)}m da loja)`
}

        // Executa as ações de gravação e atualização
        enviarParaPlanilha(novoRegistro)
        setHistorico([novoRegistro, ...historico])
        
        alert(`Sucesso! ${tipo} de ${funcionario} registrada.`);
        setFuncionario("") // Limpa o seletor para evitar erros do próximo funcionário
      },
      (error) => {
        setCarregando(false)
        alert("Acesso ao GPS negado. Para registrar o ponto, você precisa permitir a localização nas configurações do seu navegador ou aparelho.")
      },
      { enableHighAccuracy: true } // Força o dispositivo a usar GPS de máxima precisão
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h1 style={{ color: '#2e7d32', textAlign: 'center' }}>Mercadão das Frutas</h1>
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <label><b>Unidade:</b></label>
        <select onChange={(e) => setUnidade(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
          <option>Baixa Grande do Ribeiro</option>
          <option>Ribeiro Gonçalves</option>
        </select>
        
        <label><b>Funcionário:</b></label>
        <select value={funcionario} onChange={(e) => setFuncionario(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '25px', borderRadius: '5px', border: '1px solid #ddd' }}>
          <option value="">Selecione seu nome</option>
          {listaAtual.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => baterPonto("Entrada")} disabled={carregando} style={{ flex: 1, padding: '15px', background: carregando ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {carregando ? "Processando..." : "ENTRADA"}
          </button>
          <button onClick={() => baterPonto("Saída")} disabled={carregando} style={{ flex: 1, padding: '15px', background: carregando ? '#ccc' : '#f44336', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            {carregando ? "..." : "SAÍDA"}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENTE ADMIN (DASHBOARD) ---
function AreaAdmin({ historico }) {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ color: '#2e7d32' }}>Dashboard Gestão</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #2e7d32', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Nome</th><th>Tipo</th><th>Hora</th><th>Data</th><th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          {historico.map(h => (
            <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{h.nome}</td>
              <td>{h.tipo === "Entrada" ? "✅ Entrada" : "🛑 Saída"}</td>
              <td>{h.horario}</td>
              <td>{h.data}</td>
              <td>{h.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- APP PRINCIPAL ---
export default function App() {
  const [historico, setHistorico] = useState([])
  return (
    <BrowserRouter>
      <nav style={{ background: '#2e7d32', padding: '15px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>PONTO</Link>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>PAINEL ADMIN</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AreaPonto historico={historico} setHistorico={setHistorico} />} />
        <Route path="/admin" element={<AreaAdmin historico={historico} />} />
      </Routes>
    </BrowserRouter>
  )
}