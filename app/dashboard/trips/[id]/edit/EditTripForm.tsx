"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateTrip, type TripActionState } from "@/lib/actions/trips";
import { TripStatus } from "@prisma/client";

type ClubOption = {
  id: string;
  name: string;
  slug?: string;
};

type EditableTrip = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  difficulty: string;
  price: number;
  capacity: number;
  status: TripStatus;
  clubId: string;
};

const initialState: TripActionState = {
  ok: false,
  message: "",
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>;
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function EditTripForm({
  trip,
  clubs,
}: {
  trip: EditableTrip;
  clubs: ClubOption[];
}) {
  const boundAction = updateTrip.bind(null, trip.id);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-4">
      {!!state.message && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">عنوان</label>
        <input
          name="title"
          defaultValue={trip.title}
          className="w-full rounded-md border px-3 py-2"
        />
        <FieldError errors={state.fieldErrors?.title} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">توضیحات</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={trip.description ?? ""}
          className="w-full rounded-md border px-3 py-2"
        />
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">تاریخ شروع</label>
          <input
            type="date"
            name="startDate"
            defaultValue={toDateInputValue(trip.startDate)}
            className="w-full rounded-md border px-3 py-2"
          />
          <FieldError errors={state.fieldErrors?.startDate} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">تاریخ پایان</label>
          <input
            type="date"
            name="endDate"
            defaultValue={toDateInputValue(trip.endDate)}
            className="w-full rounded-md border px-3 py-2"
          />
          <FieldError errors={state.fieldErrors?.endDate} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">موقعیت</label>
        <input
          name="location"
          defaultValue={trip.location}
          className="w-full rounded-md border px-3 py-2"
        />
        <FieldError errors={state.fieldErrors?.location} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">درجه سختی</label>
        <input
          name="difficulty"
          defaultValue={trip.difficulty}
          className="w-full rounded-md border px-3 py-2"
        />
        <FieldError errors={state.fieldErrors?.difficulty} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">قیمت (تومان)</label>
          <input
            type="number"
            name="price"
            min={0}
            defaultValue={trip.price}
            className="w-full rounded-md border px-3 py-2"
          />
          <FieldError errors={state.fieldErrors?.price} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ظرفیت</label>
          <input
            type="number"
            name="capacity"
            min={1}
            defaultValue={trip.capacity}
            className="w-full rounded-md border px-3 py-2"
          />
          <FieldError errors={state.fieldErrors?.capacity} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">وضعیت</label>
          <select
            name="status"
            defaultValue={trip.status}
            className="w-full rounded-md border px-3 py-2"
          >
            {Object.values(TripStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">باشگاه</label>
          <select
            name="clubId"
            defaultValue={trip.clubId}
            className="w-full rounded-md border px-3 py-2"
          >
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.clubId} />
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
