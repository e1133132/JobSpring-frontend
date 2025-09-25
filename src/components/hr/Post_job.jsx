import React, {  useState } from "react";
import Navigation from "../navigation.jsx";
import { getCurrentUser } from "../../services/authService";
import PropTypes from "prop-types";

// const JOB_TYPES = [
//     { value: "full_time", label: "full time" },
//     { value: "part_time", label: "part time" },
//     { value: "contract", label: "contract" },
//     { value: "intern", label: "internship" },
//     { value: "remote", label: "remote" },
// ];

const initialState = {
    title: "",
    company: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    address: "",
    description: "",
};

export default function Post_job({ onSubmit }) {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverMsg, setServerMsg] = useState("");
    const [role,] = useState(getCurrentUser() ? getCurrentUser().role : 'guest');
    const [name,] = useState(getCurrentUser() ? getCurrentUser().fullName : 'guest');
    // const salaryRangeHelper = useMemo(() => {
    //     const min = Number(form.salaryMin);
    //     const max = Number(form.salaryMax);
    //     if (!form.salaryMin || !form.salaryMax) return "";
    //     if (!Number.isFinite(min) || !Number.isFinite(max)) return "Please enter numbers";
    //     if (min < 0 || max < 0) return "Salary must be non-negative";
    //     if (min > max) return "Min salary should not exceed max salary";
    //     return `${min} - ${max}`;
    // }, [form.salaryMin, form.salaryMax]);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }

    function validate() {
        const next = {};
        if (!form.title.trim()) next.title = "Please enter the job name";
        if (!form.company.trim()) next.company = "Please enter the company name";
        if (!form.jobType) next.jobType = "Please choose a job type";

        const min = Number(form.salaryMin);
        const max = Number(form.salaryMax);
        if (form.salaryMin === "") next.salaryMin = "Please enter min salary";
        else if (!Number.isFinite(min) || min < 0)
            next.salaryMin = "Min salary must be a non-negative number";

        if (form.salaryMax === "") next.salaryMax = "Please enter max salary";
        else if (!Number.isFinite(max) || max < 0)
            next.salaryMax = "Max salary must be a non-negative number";

        if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
            next.salaryMin = next.salaryMin || "Min salary should not exceed max salary";
            next.salaryMax = next.salaryMax || "Max salary should be ≥ min salary";
        }

        if (!form.description.trim()) next.description = "Please fill in the job description";
        if (!form.address.trim()) next.address = "Please fill in the address";

        setErrors(next);
        return Object.keys(next).length === 0;
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setServerMsg("");
        if (!validate()) return;

        const payload = {
            title: form.title.trim(),
            company: form.company.trim(),
            jobType: form.jobType,
            salary: { min: Number(form.salaryMin), max: Number(form.salaryMax) },
            address: form.address.trim(),
            description: form.description.trim(),
        };

        try {
            setSubmitting(true);
            if (onSubmit) {
                await onSubmit(payload);
            } else {
                // 默认直接调用后端
                const res = await fetch("/api/hr/jobs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`提交失败：${res.status}`);
            }
            setServerMsg("发布成功！");
            setForm(initialState);
        } catch (err) {
            setServerMsg(err.message || "提交失败");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="app-root">
            <Navigation role={role} username={name} />
            <p className="subheading">Post Job Positions</p>
            <form className="card" onSubmit={handleSubmit} noValidate>
                {/* Min Salary */}
                <div>
                    <label>Min Salary *</label>
                    <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 3500"
                        value={form.salaryMin}
                        onChange={(e) => updateField("salaryMin", e.target.value)}
                    />
                    {errors.salaryMin && <p>{errors.salaryMin}</p>}
                </div>

                {/* 小间距 */}
                <div style={{ height: 12 }} />

                {/* Min Salary */}
                <div>
                    <label id="label-min-salary">Min Salary *</label>
                    <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 3500"
                        value={form.salaryMin}
                        onChange={(e) => updateField("salaryMin", e.target.value)}
                        aria-labelledby="label-min-salary"
                        aria-invalid={!!errors.salaryMin}
                        aria-describedby={errors.salaryMin ? "err-min-salary" : undefined}
                    />
                    {errors.salaryMin && <p id="err-min-salary">{errors.salaryMin}</p>}
                </div>

                {/* Max Salary */}
                <div>
                    <label id="label-max-salary">Max Salary *</label>
                    <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 6000"
                        value={form.salaryMax}
                        onChange={(e) => updateField("salaryMax", e.target.value)}
                        aria-labelledby="label-max-salary"
                        aria-invalid={!!errors.salaryMax}
                        aria-describedby={errors.salaryMax ? "err-max-salary" : undefined}
                    />
                    {errors.salaryMax && <p id="err-max-salary">{errors.salaryMax}</p>}
                </div>

                {/* Address */}
                <div>
                    <label id="label-address">Address *</label>
                    <input
                        type="text"
                        placeholder="e.g. 1 Fusionopolis Way, Singapore"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        aria-labelledby="label-address"
                        aria-invalid={!!errors.address}
                        aria-describedby={errors.address ? "err-address" : undefined}
                    />
                    {errors.address && <p id="err-address">{errors.address}</p>}
                </div>

                {/* Description */}
                <div>
                    <label id="label-desc">Job Description *</label>
                    <textarea
                        rows={6}
                        placeholder="Responsibilities, requirements, benefits…"
                        value={form.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        aria-labelledby="label-desc"
                        aria-invalid={!!errors.description}
                        aria-describedby={errors.description ? "err-desc" : undefined}
                    />
                    {errors.description && <p id="err-desc">{errors.description}</p>}
                </div>


                {/* Actions */}
                <div>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Posting…" : "Post Job Position"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setForm(initialState);
                            setErrors({});
                            setServerMsg("");
                        }}
                    >
                        Reset
                    </button>
                </div>
                <style>{`
                .card { 
                border-radius: 16px;
                border: 1px solid #e5e7eb;
                background: #ffffff;
                padding: 24px;
                box-shadow: 0 8px 30px rgba(0,0,0,.06);
                }
                .card > div { margin-bottom: 16px; }

             
                .card label { 
                display: block; 
                font-weight: 600; 
                font-size: 14px; 
                margin-bottom: 6px; 
                color: #0f172a;
                }
                .card p { 
                margin: 6px 0 0; 
                font-size: 13px; 
                color: #ef4444;        
                }

               
                .card input,
                .card textarea,
                .card select {
                width: 100%;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                background: #fff;
                padding: 10px 12px;
                font: inherit;
                color: #0f172a;
                outline: none;
                transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
                box-sizing: border-box;
                }

                
                .card input:hover,
                .card textarea:hover,
                .card select:hover {
                border-color: #d1d5db;
                }
                .card input:focus,
                .card textarea:focus,
                .card select:focus {
                border-color: #93c5fd;                     
                box-shadow: 0 0 0 3px rgba(147,197,253,.45); 
                }

               
                .card [aria-invalid="true"] {
                border-color: #f87171 !important;
                box-shadow: 0 0 0 3px rgba(254,202,202,.6) !important;
                }

                
                .card input::placeholder,
                .card textarea::placeholder {
                color: #94a3b8;
                }

               
                .card button[type="submit"],
                .card button[type="button"] {
                appearance: none;
                border: 0;
                border-radius: 12px;
                padding: 10px 16px;
                font-weight: 700;
                cursor: pointer;
                transition: filter .15s ease, opacity .15s ease, box-shadow .15s ease;
                }
                .card button[type="submit"] {
                background: #111827;   
                color: #fff;
                }
                .card button[type="submit"]:hover { filter: brightness(1.03); }
                .card button[type="submit"]:disabled { opacity: .6; cursor: not-allowed; }

                .card button[type="button"] {
                background: #fff;
                color: #0f172a;
                border: 1px solid #e5e7eb;
                margin-left: 8px;
                }
                .card button[type="button"]:hover { background: #f9fafb; }

                
                .card .hint, .card .small {
                font-size: 12px;
                color: #6b7280;
                margin-top: 6px;
                }
        *{box-sizing:border-box}
      `}</style>

                {serverMsg && <div>{serverMsg}</div>}
            </form>
        </div>
    );

}
PostJob.propTypes = {
  onSubmit: PropTypes.func,   
};