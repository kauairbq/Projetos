import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../lib/api";
import type { Invoice } from "../lib/types";
import { Topbar } from "../components/Topbar";

const schema = z.object({
  userId: z.string().min(1, "ID do cliente obrigatório"),
  subscriptionId: z.string().min(1, "ID da subscrição obrigatório"),
  amountCents: z.number().min(0, "Valor inválido"),
  status: z.enum(["DRAFT", "OPEN", "PAID", "VOID"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: "",
      subscriptionId: "",
      amountCents: 0,
      status: "PAID",
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await api.get<Invoice[]>("/invoices");
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (payload: FormValues) => {
      const { data } = await api.post<Invoice>("/invoices", payload);
      return data;
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return (
    <div>
      <Topbar title="Faturas" description="Histórico de faturação e cobranças." />
      <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_1.9fr]">
        <form
          className="card space-y-4"
          onSubmit={form.handleSubmit((values) => createInvoice.mutate(values))}
        >
          <div>
            <label className="text-sm font-semibold">ID do cliente</label>
            <input className="input mt-1" {...form.register("userId")} />
            <p className="text-xs text-rose-500">{form.formState.errors.userId?.message}</p>
          </div>
          <div>
            <label className="text-sm font-semibold">ID da subscrição</label>
            <input className="input mt-1" {...form.register("subscriptionId")} />
            <p className="text-xs text-rose-500">{form.formState.errors.subscriptionId?.message}</p>
          </div>
          <div>
            <label className="text-sm font-semibold">Valor (cêntimos)</label>
            <input
              className="input mt-1"
              type="number"
              {...form.register("amountCents", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Estado</label>
            <select className="input mt-1" {...form.register("status")}>
              <option value="PAID">Pago</option>
              <option value="OPEN">Aberto</option>
              <option value="DRAFT">Rascunho</option>
              <option value="VOID">Anulado</option>
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">
            {createInvoice.isPending ? "A criar..." : "Emitir fatura"}
          </button>
        </form>

        <div className="card">
          <h3 className="text-lg font-semibold">Faturas</h3>
          <table className="table mt-4">
            <thead>
              <tr>
                <th>ID</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoicesQuery.data?.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id.slice(0, 8)}...</td>
                  <td>€ {(invoice.amountCents / 100).toFixed(2)}</td>
                  <td>{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
