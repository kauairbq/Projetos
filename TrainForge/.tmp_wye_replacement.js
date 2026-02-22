function Wye({user:e}){
  const [t,n]=_.useState([]),[r,i]=_.useState([]),[o,a]=_.useState([]),[s,l]=_.useState(null),[u,c]=_.useState({name:"",description:""}),[f,d]=_.useState({serviceId:"",notes:""}),[h,p]=_.useState({userId:"",serviceRequestId:"",budgetEstimate:"",notes:"",notificationEmail:"",extraServiceRequest:""}),m=["admin","trainer"].includes(e.role);
  const v=async()=>{
    var T,P,E,$;
    const [j,w,x,S]=await Promise.all([
      Pe.get('/services/settings'),
      Pe.get(`/services/catalog?activeOnly=${m?"false":"true"}`),
      Pe.get('/services/requests'),
      Pe.get('/services/quotes')
    ]);
    const R=(T=j.data)==null?void 0:T.data;
    l(R||null);
    n(((P=w.data)==null?void 0:P.data)||[]);
    i(((E=x.data)==null?void 0:E.data)||[]);
    a((($=S.data)==null?void 0:$.data)||[]);
    if((R==null?void 0:R.notification_email)&&!h.notificationEmail){
      p(z=>({...z,notificationEmail:R.notification_email}));
    }
  };
  _.useEffect(()=>{v().catch(()=>null)},[]);

  const y=async T=>{T.preventDefault(),f.serviceId&&(await Pe.post('/services/requests',{serviceId:Number(f.serviceId),notes:f.notes}),d({serviceId:"",notes:""}),await v())};
  const M=async T=>{T.preventDefault(),u.name&&(await Pe.post('/services/catalog',{name:u.name,description:u.description}),c({name:"",description:""}),await v())};
  const g=async(T,P)=>{if(!P&&!window.confirm('Tens a certeza que queres desativar este servico?'))return;await Pe.patch(`/services/catalog/${T}/toggle`,{isActive:P}),await v()};
  const b=async T=>{if(!window.confirm('Tens a certeza que queres excluir este servico? Esta acao nao pode ser desfeita.'))return;await Pe.delete(`/services/catalog/${T}`),await v()};
  const w=async(T,P)=>{await Pe.patch(`/services/requests/${T}/status`,{status:P}),await v()};
  const x=async T=>{T.preventDefault(),h.userId&&(await Pe.post('/services/quotes',{userId:Number(h.userId),serviceRequestId:h.serviceRequestId?Number(h.serviceRequestId):null,budgetEstimate:h.budgetEstimate?Number(h.budgetEstimate):null,notes:h.notes,notificationEmail:h.notificationEmail||null,extraServiceRequest:h.extraServiceRequest||null}),p(z=>({userId:"",serviceRequestId:"",budgetEstimate:"",notes:"",notificationEmail:z.notificationEmail||"",extraServiceRequest:""})),await v())};
  const S=async()=>{await Pe.patch('/services/settings',{notificationEmail:h.notificationEmail||null}),await v()};

  return O.jsxs('section',{className:'row g-4',children:[
    O.jsx('div',{className:'col-12',children:O.jsx('div',{className:'card tf-card',children:O.jsxs('div',{className:'card-body',children:[O.jsx('h3',{children:'Gestao de servicos e projetos'}),O.jsx('p',{className:'text-secondary mb-0',children:'Solicite servicos, acompanhe estado e gere referencias de treino e orcamentos.'})]})})}),
    O.jsx('div',{className:'col-12 col-xl-5',children:O.jsx('div',{className:'card tf-card h-100',children:O.jsxs('div',{className:'card-body',children:[
      O.jsx('h5',{children:'Solicitar servico'}),
      O.jsxs('form',{className:'d-grid gap-2',onSubmit:y,children:[
        O.jsxs('select',{className:'form-select',value:f.serviceId,onChange:T=>d({...f,serviceId:T.target.value}),children:[O.jsx('option',{value:'',children:'Selecionar servico'}),t.filter(T=>Number(T.is_active)===1).map(T=>O.jsx('option',{value:T.id,children:T.name},T.id))]}),
        O.jsx('textarea',{className:'form-control',rows:'4',placeholder:'Notas adicionais',value:f.notes,onChange:T=>d({...f,notes:T.target.value})}),
        O.jsx('button',{className:'btn btn-primary',children:'Enviar solicitacao'})
      ]})
    ]})})}),
    O.jsx('div',{className:'col-12 col-xl-7',children:O.jsx('div',{className:'card tf-card h-100',children:O.jsxs('div',{className:'card-body',children:[
      O.jsx('h5',{children:'Historico e status'}),
      O.jsx('div',{className:'table-responsive',children:O.jsxs('table',{className:'table table-dark align-middle mb-0',children:[
        O.jsx('thead',{children:O.jsxs('tr',{children:[O.jsx('th',{children:'Servico'}),O.jsx('th',{children:'Status'}),O.jsx('th',{children:'Notas'}),m?O.jsx('th',{children:'Acoes'}):null]})}),
        O.jsx('tbody',{children:r.map(T=>O.jsxs('tr',{children:[O.jsx('td',{children:T.service_name}),O.jsx('td',{children:T.status}),O.jsx('td',{children:T.notes||'-'}),m?O.jsx('td',{children:O.jsxs('select',{className:'form-select form-select-sm',value:T.status,onChange:P=>w(T.id,P.target.value),children:[O.jsx('option',{value:'pending',children:'pending'}),O.jsx('option',{value:'approved',children:'approved'}),O.jsx('option',{value:'in_progress',children:'in_progress'}),O.jsx('option',{value:'completed',children:'completed'}),O.jsx('option',{value:'cancelled',children:'cancelled'})]})}):null]},T.id))})
      ]})})
    ]})})}),
    m&&O.jsxs(O.Fragment,{children:[
      O.jsx('div',{className:'col-12 col-lg-6',children:O.jsx('div',{className:'card tf-card h-100',children:O.jsxs('div',{className:'card-body',children:[
        O.jsx('h5',{children:'Catalogo de servicos'}),
        O.jsxs('form',{className:'d-grid gap-2 mb-3',onSubmit:M,children:[
          O.jsx('input',{className:'form-control',placeholder:'Nome do servico',value:u.name,onChange:T=>c({...u,name:T.target.value})}),
          O.jsx('textarea',{className:'form-control',rows:'3',placeholder:'Descricao',value:u.description,onChange:T=>c({...u,description:T.target.value})}),
          O.jsx('button',{className:'btn btn-primary',children:'Adicionar servico'})
        ]}),
        O.jsx('ul',{className:'tf-mini-list mb-0',children:t.map(T=>O.jsxs('li',{className:'d-flex justify-content-between align-items-center gap-2 flex-wrap',children:[
          O.jsx('span',{children:T.name}),
          O.jsxs('div',{className:'d-flex gap-2 flex-wrap',children:[
            Number(T.is_active)===1?O.jsx('button',{className:'btn btn-sm btn-warning text-dark',onClick:()=>g(T.id,false),children:'Desativar'}):O.jsx('button',{className:'btn btn-sm btn-success',onClick:()=>g(T.id,true),children:'Ativar'}),
            O.jsx('button',{className:'btn btn-sm btn-danger',onClick:()=>b(T.id),children:'Excluir'})
          ]})
        ]},T.id))})
      ]})})}),
      O.jsx('div',{className:'col-12 col-lg-6',children:O.jsx('div',{className:'card tf-card h-100',children:O.jsxs('div',{className:'card-body',children:[
        O.jsx('h5',{children:'Orcamentos'}),
        O.jsxs('div',{className:'alert alert-info py-2',children:['Email para receber pedidos de alunos: ',O.jsx('strong',{children:(s==null?void 0:s.notification_email)||'nao definido'})]}),
        O.jsxs('form',{className:'row g-2 mb-3',onSubmit:x,children:[
          O.jsx('div',{className:'col-md-4',children:O.jsx('input',{className:'form-control',placeholder:'ID cliente',value:h.userId,onChange:T=>p({...h,userId:T.target.value})})}),
          O.jsx('div',{className:'col-md-4',children:O.jsx('input',{className:'form-control',placeholder:'ID solicitacao',value:h.serviceRequestId,onChange:T=>p({...h,serviceRequestId:T.target.value})})}),
          O.jsx('div',{className:'col-md-4',children:O.jsx('input',{className:'form-control',placeholder:'Valor',value:h.budgetEstimate,onChange:T=>p({...h,budgetEstimate:T.target.value})})}),
          O.jsx('div',{className:'col-12',children:O.jsx('input',{type:'email',className:'form-control',placeholder:'Email para notificacoes (personal/ginasio)',value:h.notificationEmail,onChange:T=>p({...h,notificationEmail:T.target.value})})}),
          O.jsx('div',{className:'col-12',children:O.jsx('textarea',{className:'form-control',rows:'2',placeholder:'Notas',value:h.notes,onChange:T=>p({...h,notes:T.target.value})})}),
          O.jsx('div',{className:'col-12',children:O.jsx('textarea',{className:'form-control',rows:'2',placeholder:'Pedido de novos servicos para equipe TrainForge (opcional)',value:h.extraServiceRequest,onChange:T=>p({...h,extraServiceRequest:T.target.value})})}),
          O.jsxs('div',{className:'col-12 d-flex flex-wrap gap-2',children:[
            O.jsx('button',{className:'btn btn-outline-light',type:'button',onClick:S,children:'Guardar email de notificacoes'}),
            O.jsx('button',{className:'btn btn-primary',children:'Emitir orcamento'})
          ]})
        ]}),
        O.jsx('ul',{className:'tf-mini-list mb-0',children:o.map(T=>O.jsxs('li',{children:['Cliente #',T.student_id||'-',' - ',T.status,' - ',T.budget_estimate??'n/a']},T.id))})
      ]})})})
    ]})
  ]});
}
const Hye=ab
