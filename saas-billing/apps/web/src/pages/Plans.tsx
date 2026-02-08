import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import type { Plan } from "../lib/types";
import { Topbar } from "../components/Topbar";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  priceCents: z.number().min(0, "Preço inválido"),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function PlansPage() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      priceCents: 0,
      interval: "MONTHLY",
      active: true,
    },
  });

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await api.get<Plan[]>("/plans");
      return data;
    },
  });

  const createPlan = useMutation({
    mutationFn: async (payload: FormValues) => {
      const { data } = await api.post<Plan>("/plans", payload);
      return data;
    },
    onSuccess: async () => {
      form.reset({
        name: "",
        description: "",
        priceCents: 0,
        interval: "MONTHLY",
        active: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  return (
    <div>
      <Topbar title="Planos" description="Criação e gestão de planos comerciais." />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1.9fr]">
        <form
          className="card space-y-4"
          onSubmit={form.handleSubmit((values) => createPlan.mutate(values))}
        >
          <div>
            <label className="text-sm font-semibold">Nome do plano</label>
            <input className="input mt-1" {...form.register("name")} />
            <p className="text-xs text-rose-500">{form.formState.errors.name?.message}</p>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea className="input mt-1 h-24" {...form.register("description")} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Preço (cêntimos)</label>
              <input
                className="input mt-1"
                type="number"
                {...form.register("priceCents", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Intervalo</label>
              <select className="input mt-1" {...form.register("interval")}>
                <option value="MONTHLY">Mensal</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("active")} />
            Ativo
          </label>
          <button className="btn btn-primary w-full" type="submit">
            {createPlan.isPending ? "A criar..." : "Guardar plano"}
          </button>
        </form>

        <div className="card">
          <h3 className="text-lg font-semibold">Planos disponíveis</h3>
          <table className="table mt-4">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Preço</th>
                <th>Intervalo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {plansQuery.data?.map((plan) => (
                <tr key={plan.id}>
                  <td>{plan.name}</td>
                  <td>€ {(plan.priceCents / 100).toFixed(2)}</td>
                  <td>{plan.interval}</td>
                  <td>{plan.active ? "Ativo" : "Inativo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
