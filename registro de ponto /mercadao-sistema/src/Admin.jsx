export default function Admin({ historico }) {
  // Aqui você pode criar lógicas para somar horas no futuro
  const totalEntradas = historico.filter(r => r.tipo === "Entrada").length;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#2e7d32' }}>Painel de Controle - Mercadão das Frutas</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f0f4f8', borderRadius: '10px', flex: 1 }}>
          <p>Total de Presenças (Hoje)</p>
          <h1 style={{ margin: 0 }}>{totalEntradas}</h1>
        </div>
        
        <div style={{ padding: '20px', background: '#fff9db', borderRadius: '10px', flex: 1 }}>
          <p>Alertas de Gestão</p>
          <h1 style={{ margin: 0, color: '#f08c00' }}>0</h1>
        </div>
      </div>

      <h3>Registros Recentes</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th>Funcionário</th>
            <th>Tipo</th>
            <th>Horário</th>
            <th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          {historico.map(reg => (
            <tr key={reg.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 0' }}>{reg.nome}</td>
              <td>{reg.tipo}</td>
              <td>{reg.horario}</td>
              <td>{reg.unidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}