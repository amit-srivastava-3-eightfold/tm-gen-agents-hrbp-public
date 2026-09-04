import { jsxs as b, Fragment as V, jsx as a } from "react/jsx-runtime";
import * as u from "react";
import oe, { isValidElement as Ot, cloneElement as Dt, forwardRef as Da, useState as _t, useLayoutEffect as Ia } from "react";
import { Slot as It, createSlot as We } from "@radix-ui/react-slot";
import { cva as qe } from "class-variance-authority";
import { clsx as Va } from "clsx";
import { twMerge as Ba } from "tailwind-merge";
import * as W from "@radix-ui/react-dropdown-menu";
import * as fn from "@radix-ui/react-toggle-group";
import * as Kn from "react-dom";
import Gn, { createPortal as $a } from "react-dom";
import * as Qe from "@radix-ui/react-tabs";
import { Check as Za, ChevronDown as Yn, ChevronUp as Ha } from "lucide-react";
import * as z from "@radix-ui/react-select";
import * as wt from "@radix-ui/react-progress";
import * as Z from "@radix-ui/react-dialog";
import { CORNER_RADIUS_TOKENS as gu, SPACING_TOKENS as vu } from "./tokens.js";
function x(...e) {
  return Ba(Va(e));
}
const ja = qe("btn", {
  variants: {
    variant: {
      default: "btn--default",
      primary: "btn--primary",
      destructive: "btn--destructive",
      outline: "btn--outline",
      secondary: "btn--secondary",
      ghost: "btn--ghost",
      link: "btn--link",
      orange: "btn--orange"
    },
    size: {
      default: "btn--default",
      xs: "btn--xs",
      sm: "btn--sm",
      lg: "btn--lg",
      icon: "btn--icon",
      "icon-xs": "btn--icon-xs",
      "icon-sm": "btn--icon-sm",
      "icon-lg": "btn--icon-lg"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
function pn(e, t) {
  return e == null ? null : Ot(e) ? Dt(e, {
    "data-icon": t
  }) : /* @__PURE__ */ a("span", { "data-icon": t, style: { display: "inline-flex" }, children: e });
}
function Wa({
  className: e,
  variant: t = "default",
  size: n = "default",
  asChild: r = !1,
  leadingIcon: o,
  trailingIcon: i,
  badge: s,
  children: l,
  ...c
}) {
  const f = r ? It : "button", p = o != null || i != null || s != null ? /* @__PURE__ */ b(V, { children: [
    o != null && pn(o, "inline-start"),
    l,
    s != null && /* @__PURE__ */ a("span", { className: "btn__badge", "data-slot": "button-badge", children: s > 99 ? "99+" : s }),
    i != null && pn(i, "inline-end")
  ] }) : l;
  return /* @__PURE__ */ a(
    f,
    {
      "data-slot": "button",
      "data-variant": t,
      "data-size": n,
      className: x(ja({ variant: t, size: n, className: e })),
      ...c,
      children: p
    }
  );
}
function za(e) {
  return /* @__PURE__ */ a(
    W.Root,
    {
      "data-slot": "dropdown-menu",
      ...e
    }
  );
}
function Ua(e) {
  return /* @__PURE__ */ a(
    W.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...e
    }
  );
}
function Ka(e) {
  return /* @__PURE__ */ a(W.Portal, { ...e });
}
function Ga({
  className: e,
  sideOffset: t = 4,
  align: n = "start",
  ...r
}) {
  return /* @__PURE__ */ a(W.Portal, { children: /* @__PURE__ */ a(
    W.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset: t,
      align: n,
      className: x(e),
      ...r
    }
  ) });
}
function Ya({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    W.Item,
    {
      "data-slot": "dropdown-menu-item",
      className: x(e),
      ...t
    }
  );
}
function Xa({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    W.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: x(e),
      ...t
    }
  );
}
const st = Object.assign(za, {
  Trigger: Ua,
  Portal: Ka,
  Content: Ga,
  Item: Ya,
  Separator: Xa
});
function Yc({
  children: e,
  menu: t,
  variant: n = "outline",
  size: r = "default",
  trigger: o,
  buttonProps: i,
  align: s = "end",
  sideOffset: l = 4
}) {
  const c = o ?? /* @__PURE__ */ a(Wa, { variant: n, size: r, ...i, children: e });
  return /* @__PURE__ */ b(st, { children: [
    /* @__PURE__ */ a(st.Trigger, { asChild: !0, children: c }),
    /* @__PURE__ */ a(st.Content, { align: s, sideOffset: l, children: t })
  ] });
}
const qa = Da(function({
  size: t = "medium",
  shape: n = "rounded",
  state: r = "default",
  leadingIcon: o,
  trailingIcon: i,
  onClear: s,
  className: l = "",
  disabled: c,
  type: f = "text",
  ...d
}, p) {
  const m = [
    "input",
    `input--${t}`,
    `input--${n}`,
    r !== "default" && `input--${r}`,
    c && "input--disabled",
    l
  ].filter(Boolean).join(" "), g = (v) => typeof v == "string" ? /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: v }) : v;
  return /* @__PURE__ */ b("div", { className: m, children: [
    o != null && /* @__PURE__ */ a("span", { className: "input__leading-icon", "aria-hidden": !0, children: g(o) }),
    /* @__PURE__ */ a(
      "input",
      {
        ref: p,
        type: f,
        className: "input__field",
        disabled: c,
        "aria-invalid": r === "error" ? !0 : void 0,
        ...d
      }
    ),
    (i != null || s) && /* @__PURE__ */ a("span", { className: "input__trailing", children: s ? /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        className: "input__clear",
        onClick: s,
        disabled: c,
        "aria-label": "Clear",
        children: i != null ? g(i) : /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "close" })
      }
    ) : /* @__PURE__ */ a("span", { className: "input__trailing-icon", "aria-hidden": !0, children: g(i) }) })
  ] });
});
function Vt({ icon: e, children: t, variant: n = "neutral", size: r = "medium", className: o = "" }) {
  return /* @__PURE__ */ b("span", { className: `pill pill--${n} pill--${r} ${o}`.trim(), children: [
    e && /* @__PURE__ */ a("span", { className: "material-symbols-outlined pill__icon", children: e }),
    t
  ] });
}
function Qa({ trend: e, size: t }) {
  const n = t === "lg" ? 20 : t === "md" ? 18 : 14, r = t === "lg" ? 28 : t === "md" ? 24 : 20, o = e === "exceed" ? "arrow_upward" : e === "meet" ? "remove" : "arrow_downward";
  return /* @__PURE__ */ a(
    "span",
    {
      className: x("skill-tag__trend", `skill-tag__trend--${e}`),
      style: { width: r, height: r },
      children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: n }, "aria-hidden": !0, children: o })
    }
  );
}
function Ja({ size: e }) {
  const t = e === "lg" ? 20 : e === "md" ? 18 : 14, n = e === "lg" ? 28 : e === "md" ? 24 : 20;
  return /* @__PURE__ */ a(
    "span",
    {
      className: "skill-tag__trend skill-tag__trend--upskilling",
      style: { width: n, height: n },
      children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: t }, "aria-hidden": !0, children: "trending_up" })
    }
  );
}
const eo = u.forwardRef(
  ({
    className: e,
    children: t,
    size: n = "md",
    variant: r = "default",
    action: o = "none",
    active: i = !1,
    endorseCount: s,
    trend: l,
    upskilling: c = !1,
    onAction: f,
    ...d
  }, p) => {
    const m = n === "lg" ? 20 : n === "md" ? 18 : 14;
    return /* @__PURE__ */ b(
      "span",
      {
        ref: p,
        "data-slot": "skill-tag",
        className: x(
          "skill-tag",
          `skill-tag--${n}`,
          `skill-tag--${r}`,
          i && "skill-tag--active",
          e
        ),
        ...d,
        children: [
          r === "matched" && /* @__PURE__ */ a("span", { className: "skill-tag__leading skill-tag__leading--matched", children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: m }, "aria-hidden": !0, children: "check" }) }),
          r === "highlighted" && /* @__PURE__ */ a("span", { className: "skill-tag__leading skill-tag__leading--highlighted", children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: m }, "aria-hidden": !0, children: "star" }) }),
          l && /* @__PURE__ */ a(Qa, { trend: l, size: n }),
          l && c && /* @__PURE__ */ a(Ja, { size: n }),
          /* @__PURE__ */ a("span", { className: "skill-tag__label", children: t }),
          o === "add" && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "skill-tag__action-btn",
              onClick: f,
              "aria-label": i ? "Remove" : "Add",
              children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: m }, "aria-hidden": !0, children: i ? "close" : "add" })
            }
          ),
          o === "save" && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "skill-tag__action-btn",
              onClick: f,
              "aria-label": i ? "Unsave" : "Save",
              children: /* @__PURE__ */ a(
                "span",
                {
                  className: "material-symbols-outlined",
                  style: {
                    fontSize: m,
                    fontVariationSettings: i ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                  },
                  "aria-hidden": !0,
                  children: "bookmark"
                }
              )
            }
          ),
          o === "endorse" && /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              className: "skill-tag__action-btn skill-tag__action-btn--endorse",
              onClick: f,
              "aria-label": "Endorse",
              children: [
                /* @__PURE__ */ a(
                  "span",
                  {
                    className: "material-symbols-outlined",
                    style: {
                      fontSize: m,
                      fontVariationSettings: i ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
                    },
                    "aria-hidden": !0,
                    children: "thumb_up"
                  }
                ),
                s != null && /* @__PURE__ */ a("span", { className: "skill-tag__endorse-count", children: s })
              ]
            }
          )
        ]
      }
    );
  }
);
eo.displayName = "SkillTag";
function mn(e, t) {
  return e == null ? null : Ot(e) ? Dt(e, {
    "data-icon": t
  }) : /* @__PURE__ */ a("span", { "data-icon": t, style: { display: "inline-flex" }, children: e });
}
function to({
  children: e,
  onRemove: t,
  variant: n = "default",
  color: r,
  size: o = "24",
  value: i,
  className: s,
  disabled: l = !1,
  leadingIcon: c,
  trailingIcon: f
}) {
  const d = x(
    "tag",
    o === "24" && "tag--24",
    o === "30" && "tag--30",
    o === "44" && "tag--44",
    n === "selected" && "tag--selected",
    n === "disabled" && "tag--disabled",
    r && `tag--color-${r}`,
    s
  );
  return /* @__PURE__ */ b("span", { className: d, "data-value": i, children: [
    c != null && mn(c, "inline-start"),
    e,
    f != null && mn(f, "inline-end"),
    t && !l && /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        className: "tag__remove",
        onClick: (p) => {
          p.stopPropagation(), t();
        },
        "aria-label": `Remove ${typeof e == "string" ? e : "tag"}`,
        children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
      }
    )
  ] });
}
function no(e) {
  return x("tag", "tag--selectable", `tag--${e}`);
}
function ro(e) {
  return oe.isValidElement(e) && typeof e.type != "string" && (e.type === to || e.type.displayName === "Tag");
}
function Xc({
  type: e = "single",
  value: t,
  onValueChange: n,
  defaultValue: r,
  disabled: o = !1,
  size: i = "24",
  children: s,
  className: l
}) {
  return /* @__PURE__ */ a(
    fn.Root,
    {
      type: e,
      value: t,
      onValueChange: n,
      defaultValue: r,
      disabled: o,
      className: x("tag-group", l),
      asChild: !1,
      children: oe.Children.map(s, (c) => {
        if (!ro(c)) return c;
        const f = c.props.value;
        if (f == null) return c;
        const { leadingIcon: d, trailingIcon: p } = c.props;
        return /* @__PURE__ */ b(
          fn.Item,
          {
            value: f,
            className: no(i),
            disabled: c.props.disabled,
            children: [
              d != null && /* @__PURE__ */ a("span", { "data-icon": "inline-start", children: d }),
              c.props.children,
              p != null && /* @__PURE__ */ a("span", { "data-icon": "inline-end", children: p })
            ]
          },
          f
        );
      })
    }
  );
}
const ao = qe("badge", {
  variants: {
    variant: {
      default: "badge--default",
      primary: "badge--primary",
      secondary: "badge--secondary",
      destructive: "badge--destructive",
      outline: "badge--outline",
      ghost: "badge--ghost",
      link: "badge--link"
    },
    size: {
      44: "badge--44",
      30: "badge--30",
      24: "badge--24",
      none: "badge--none"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "24"
  }
});
function hn(e, t) {
  return e == null ? null : Ot(e) ? Dt(e, {
    "data-icon": t
  }) : /* @__PURE__ */ a("span", { "data-icon": t, style: { display: "inline-flex" }, children: e });
}
function qc({
  className: e,
  variant: t = "default",
  size: n = "24",
  asChild: r = !1,
  leadingIcon: o,
  trailingIcon: i,
  children: s,
  ...l
}) {
  const c = r ? It : "span", f = r ? s : /* @__PURE__ */ b(V, { children: [
    o != null && hn(o, "inline-start"),
    s,
    i != null && hn(i, "inline-end")
  ] });
  return /* @__PURE__ */ a(
    c,
    {
      "data-slot": "badge",
      "data-variant": t,
      "data-size": n,
      className: x(ao({ variant: t, size: n }), e),
      ...l,
      children: f
    }
  );
}
const oo = "m-0 flex list-none flex-wrap items-center gap-0 p-0 break-words", io = "inline-flex items-center", Xn = "rounded-sm text-[length:14px] font-semibold leading-[1.43] text-[#4f5666] bg-transparent border-none cursor-pointer p-0 no-underline transition-colors hover:text-[#1a212e] hover:underline hover:[text-underline-offset:2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background", so = "text-[length:14px] font-bold leading-[1.43] text-[#1a212e]", lo = "inline-flex shrink-0 select-none items-center justify-center text-[#94a3b8] mx-1.5 [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0";
function Qc({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "nav",
    {
      "aria-label": "breadcrumb",
      "data-slot": "breadcrumb",
      className: x("flex h-14 w-full items-center", e),
      ...t
    }
  );
}
function Jc({ className: e, ...t }) {
  return /* @__PURE__ */ a("ol", { "data-slot": "breadcrumb-list", className: x(oo, e), ...t });
}
function ed({ className: e, ...t }) {
  return /* @__PURE__ */ a("li", { "data-slot": "breadcrumb-item", className: x(io, e), ...t });
}
function td({ asChild: e, className: t, ...n }) {
  return /* @__PURE__ */ a(
    e ? It : "button",
    {
      "data-slot": "breadcrumb-link",
      type: e ? void 0 : "button",
      className: x(Xn, t),
      ...n
    }
  );
}
function nd({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "span",
    {
      "data-slot": "breadcrumb-page",
      role: "link",
      "aria-disabled": "true",
      "aria-current": "page",
      className: x(so, e),
      ...t
    }
  );
}
function rd({ children: e, className: t, ...n }) {
  return /* @__PURE__ */ a(
    "li",
    {
      "data-slot": "breadcrumb-separator",
      role: "presentation",
      "aria-hidden": "true",
      className: x(lo, t),
      ...n,
      children: e ?? /* @__PURE__ */ a("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ a("path", { d: "m9 18 6-6-6-6" }) })
    }
  );
}
function ad({ className: e, children: t, ...n }) {
  return /* @__PURE__ */ a(
    "span",
    {
      "data-slot": "breadcrumb-ellipsis",
      className: x(Xn, e),
      ...n,
      children: t ?? "…"
    }
  );
}
const co = {
  coffee: { icon: "local_cafe", title: "Coffee chat" },
  mentoring: { icon: "group", title: "Mentoring" },
  project: { icon: "bar_chart", title: "Project" }
};
function qn({ items: e, showLabel: t = !0, labelAsButton: n = !0, className: r = "" }) {
  return /* @__PURE__ */ b("div", { className: `open-to ${r}`.trim(), children: [
    t && (n ? /* @__PURE__ */ b("button", { type: "button", className: "open-to__select", "aria-haspopup": "listbox", "aria-expanded": !1, children: [
      /* @__PURE__ */ a("span", { className: "open-to__label", children: "Open to" }),
      /* @__PURE__ */ a("span", { className: "material-symbols-outlined open-to__chevron", "aria-hidden": !0, children: "expand_more" })
    ] }) : /* @__PURE__ */ a("span", { className: "open-to__label open-to__label--plain", children: "Open to" })),
    /* @__PURE__ */ a("div", { className: "open-to__icons", children: e.map((o) => {
      const { icon: i, title: s } = co[o];
      return /* @__PURE__ */ a("span", { className: `open-to__icon open-to__icon--${o}`, title: s, "aria-hidden": !0, children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined open-to__icon-symbol", children: i }) }, o);
    }) })
  ] });
}
function uo({ to: e, children: t, className: n }) {
  return /* @__PURE__ */ a("a", { href: e, className: n, children: t });
}
function fo({
  title: e,
  badge: t,
  description: n,
  recommendedLabel: r,
  icon: o,
  bgColor: i,
  iconBgColor: s,
  iconColor: l,
  textColor: c = "#3B2600",
  buttonLabel: f,
  buttonHref: d = "#",
  children: p,
  fixedSize: m = !0,
  LinkComponent: g = uo
}) {
  return /* @__PURE__ */ b(
    "div",
    {
      className: `insight-card ${m ? "insight-card--fixed" : ""}`,
      style: {
        "--insight-card-bg": i,
        "--insight-card-icon-bg": s,
        "--insight-card-icon-color": l,
        "--insight-card-text-color": c
      },
      children: [
        /* @__PURE__ */ b("div", { className: "insight-card__header", children: [
          /* @__PURE__ */ b("div", { className: "insight-card__header-content", children: [
            /* @__PURE__ */ b("div", { className: "insight-card__title-row", children: [
              /* @__PURE__ */ a("h3", { className: "insight-card__title", children: e }),
              t && /* @__PURE__ */ a("span", { className: "insight-card__badge", children: t })
            ] }),
            /* @__PURE__ */ a("p", { className: "insight-card__description", children: n })
          ] }),
          /* @__PURE__ */ a("div", { className: "insight-card__icon-wrap", "aria-hidden": !0, children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined insight-card__icon", children: o }) })
        ] }),
        r && /* @__PURE__ */ a("span", { className: "insight-card__recommended", children: r }),
        /* @__PURE__ */ a("div", { className: "insight-card__content", children: p }),
        /* @__PURE__ */ a(g, { to: d, className: "insight-card__btn", children: f })
      ]
    }
  );
}
function po({ to: e, children: t, className: n }) {
  return /* @__PURE__ */ a("a", { href: e, className: n, children: t });
}
function od({
  course: e,
  href: t = "#",
  showBookmark: n = !0,
  renderFacepile: r,
  LinkComponent: o = po,
  bottomBar: i
}) {
  const s = o, l = i ?? (e.completedBy && e.completedBy.length > 0 ? { type: "completedBy", avatars: e.completedBy } : void 0), c = l && l.type !== "none", f = /* @__PURE__ */ b("div", { className: "course-object-card__inner", children: [
    /* @__PURE__ */ b("div", { className: "course-object-card__banner", children: [
      /* @__PURE__ */ a("div", { className: "course-object-card__tag-wrap", children: /* @__PURE__ */ a(Vt, { icon: "menu_book", variant: "blueGreen", size: "small", children: "Course" }) }),
      /* @__PURE__ */ b("div", { className: "course-object-card__banner-actions", children: [
        /* @__PURE__ */ a("button", { type: "button", className: "course-object-card__icon-btn", "aria-label": "Add to learning plan", onClick: (d) => d.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "add" }) }),
        n && /* @__PURE__ */ a("button", { type: "button", className: "course-object-card__icon-btn", "aria-label": "Save course", onClick: (d) => d.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "bookmark" }) })
      ] })
    ] }),
    /* @__PURE__ */ b("div", { className: "course-object-card__body", children: [
      /* @__PURE__ */ a("span", { className: "course-object-card__title", children: e.title }),
      (e.provider || e.duration) && /* @__PURE__ */ a("span", { className: "course-object-card__meta", children: [e.provider, e.duration].filter(Boolean).join(" • ") }),
      e.skills && e.skills.length > 0 && /* @__PURE__ */ b("div", { className: "course-object-card__skills", children: [
        e.skills.slice(0, 2).map((d) => /* @__PURE__ */ a("span", { className: "course-object-card__skill-tag", children: d }, d)),
        e.skills.length > 2 && /* @__PURE__ */ b("span", { className: "course-object-card__skill-tag course-object-card__skill-tag--more", children: [
          "+",
          e.skills.length - 2
        ] })
      ] })
    ] }),
    c && /* @__PURE__ */ b(V, { children: [
      /* @__PURE__ */ a("div", { className: "course-object-card__divider", "aria-hidden": !0 }),
      /* @__PURE__ */ a("div", { className: "object-card-bottom-bar", children: /* @__PURE__ */ b("div", { className: "object-card-bottom-bar__content", children: [
        l.type === "completedBy" && /* @__PURE__ */ b(V, { children: [
          r ? r({ avatarUrls: l.avatars }) : /* @__PURE__ */ a("div", { className: "course-object-card__facepile", children: l.avatars.map((d, p) => /* @__PURE__ */ a("img", { src: d, alt: "", className: "course-object-card__facepile-avatar" }, p)) }),
          /* @__PURE__ */ a("span", { className: "course-object-card__completed-text", children: "completed this" })
        ] }),
        l.type === "openTo" && /* @__PURE__ */ a(qn, { items: l.items, labelAsButton: !1 }),
        l.type === "buttons" && /* @__PURE__ */ a("div", { className: "course-object-card__bottom-buttons", children: l.children })
      ] }) })
    ] })
  ] });
  return t === "#" ? /* @__PURE__ */ a("div", { className: "course-object-card", children: f }) : /* @__PURE__ */ a(s, { to: t, className: "course-object-card", children: f });
}
function mo({ to: e, children: t, className: n }) {
  return /* @__PURE__ */ a("a", { href: e, className: n, children: t });
}
function id({
  project: e,
  href: t = "#",
  showBookmark: n = !0,
  showBottomBar: r = !0,
  renderFacepile: o,
  LinkComponent: i = mo
}) {
  const s = i, l = /* @__PURE__ */ b("div", { className: "project-object-card__inner", children: [
    /* @__PURE__ */ b("div", { className: "project-object-card__banner", children: [
      /* @__PURE__ */ a("div", { className: "project-object-card__tag-wrap", children: /* @__PURE__ */ a(Vt, { icon: "folder", variant: "blueGreen", size: "small", children: "Project" }) }),
      /* @__PURE__ */ b("div", { className: "project-object-card__banner-actions", children: [
        /* @__PURE__ */ a("button", { type: "button", className: "project-object-card__icon-btn", "aria-label": "Add to workspace", onClick: (c) => c.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "add" }) }),
        n && /* @__PURE__ */ a("button", { type: "button", className: "project-object-card__icon-btn", "aria-label": "Save project", onClick: (c) => c.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "bookmark" }) })
      ] })
    ] }),
    /* @__PURE__ */ b("div", { className: "project-object-card__body", children: [
      /* @__PURE__ */ a("span", { className: "project-object-card__title", children: e.title }),
      (e.owner || e.status) && /* @__PURE__ */ a("span", { className: "project-object-card__meta", children: [e.owner, e.status].filter(Boolean).join(" • ") }),
      e.skills && e.skills.length > 0 && /* @__PURE__ */ b("div", { className: "project-object-card__skills", children: [
        e.skills.slice(0, 2).map((c) => /* @__PURE__ */ a("span", { className: "project-object-card__skill-tag", children: c }, c)),
        e.skills.length > 2 && /* @__PURE__ */ b("span", { className: "project-object-card__skill-tag project-object-card__skill-tag--more", children: [
          "+",
          e.skills.length - 2
        ] })
      ] }),
      e.projectManager && /* @__PURE__ */ b("div", { className: "project-object-card__manager", children: [
        e.projectManager.avatarSrc ? /* @__PURE__ */ a(
          "img",
          {
            src: e.projectManager.avatarSrc,
            alt: "",
            className: "project-object-card__manager-avatar"
          }
        ) : /* @__PURE__ */ a("span", { className: "project-object-card__manager-avatar project-object-card__manager-avatar--fallback", "aria-hidden": !0, children: e.projectManager.name.slice(0, 2).toUpperCase() }),
        /* @__PURE__ */ b("div", { className: "project-object-card__manager-info", children: [
          /* @__PURE__ */ a("span", { className: "project-object-card__manager-name", children: e.projectManager.name }),
          /* @__PURE__ */ a("span", { className: "project-object-card__manager-label", children: "Project manager" })
        ] })
      ] })
    ] }),
    r && /* @__PURE__ */ b(V, { children: [
      /* @__PURE__ */ a("div", { className: "project-object-card__divider", "aria-hidden": !0 }),
      /* @__PURE__ */ a("div", { className: "object-card-bottom-bar", children: /* @__PURE__ */ a("div", { className: "object-card-bottom-bar__content", children: e.contributedBy && e.contributedBy.length > 0 && /* @__PURE__ */ b(V, { children: [
        o ? o({ avatarUrls: e.contributedBy }) : /* @__PURE__ */ a("div", { className: "project-object-card__facepile", children: e.contributedBy.map((c, f) => /* @__PURE__ */ a("img", { src: c, alt: "", className: "project-object-card__facepile-avatar" }, f)) }),
        /* @__PURE__ */ a("span", { className: "project-object-card__contributed-text", children: "contributors" })
      ] }) }) })
    ] })
  ] });
  return t === "#" ? /* @__PURE__ */ a("div", { className: "project-object-card", children: l }) : /* @__PURE__ */ a(s, { to: t, className: "project-object-card", children: l });
}
function ho(e) {
  const t = e.trim().split(/\s+/);
  return t.length >= 2 ? ((t[0]?.[0] ?? "") + (t[1]?.[0] ?? "")).toUpperCase().slice(0, 2) : e.slice(0, 2).toUpperCase() || "?";
}
function go({ to: e, children: t, className: n }) {
  return /* @__PURE__ */ a("a", { href: e, className: n, children: t });
}
function sd({
  person: e,
  href: t = "#",
  showBookmark: n = !0,
  renderAvatar: r,
  LinkComponent: o = go
}) {
  const i = o, s = /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ b("div", { className: "people-object-card__banner", children: [
      /* @__PURE__ */ a("div", { className: "people-object-card__tag-wrap", children: /* @__PURE__ */ a(Vt, { icon: "person", variant: "orange", size: "small", children: "People" }) }),
      /* @__PURE__ */ b("div", { className: "people-object-card__banner-actions", children: [
        /* @__PURE__ */ a("button", { type: "button", className: "people-object-card__icon-btn", "aria-label": "View org chart", onClick: (l) => l.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "account_tree" }) }),
        n && /* @__PURE__ */ a("button", { type: "button", className: "people-object-card__icon-btn", "aria-label": "Remove from favorites", onClick: (l) => l.preventDefault(), children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "bookmark" }) })
      ] }),
      /* @__PURE__ */ a("div", { className: "people-object-card__pattern", "aria-hidden": !0 })
    ] }),
    /* @__PURE__ */ a("div", { className: "people-object-card__avatar-wrap", children: r ? r({
      src: e.avatarSrc,
      alt: e.name,
      fallback: ho(e.name)
    }) : /* @__PURE__ */ a("img", { src: e.avatarSrc, alt: "", className: "people-object-card__avatar" }) }),
    /* @__PURE__ */ b("div", { className: "people-object-card__body", children: [
      /* @__PURE__ */ a("span", { className: "people-object-card__name", children: e.name }),
      /* @__PURE__ */ a("span", { className: "people-object-card__title", children: e.title }),
      /* @__PURE__ */ a("span", { className: "people-object-card__email", children: e.email })
    ] }),
    /* @__PURE__ */ a("div", { className: "people-object-card__divider", "aria-hidden": !0 }),
    /* @__PURE__ */ a("div", { className: "object-card-bottom-bar", children: /* @__PURE__ */ a("div", { className: "object-card-bottom-bar__content", children: /* @__PURE__ */ a(qn, { items: [e.openTo], labelAsButton: !1, className: "people-object-card__open-to" }) }) })
  ] });
  return t === "#" ? /* @__PURE__ */ a("div", { className: "people-object-card", children: s }) : /* @__PURE__ */ a(i, { to: t, className: "people-object-card", children: s });
}
const ve = {
  title: "Mentors",
  badge: "11",
  description: "Get guidance and support",
  recommendedLabel: "Recommended for you",
  buttonLabel: "Explore Mentors",
  buttonHref: "#"
};
function ld({
  title: e = ve.title,
  badge: t = ve.badge,
  description: n = ve.description,
  recommendedLabel: r = ve.recommendedLabel,
  buttonLabel: o = ve.buttonLabel,
  buttonHref: i = ve.buttonHref,
  mentor: s,
  fixedSize: l = !0,
  LinkComponent: c
}) {
  return /* @__PURE__ */ a(
    fo,
    {
      title: e,
      badge: t,
      description: n,
      recommendedLabel: r,
      icon: "groups",
      bgColor: "#FFF0D6",
      iconBgColor: "#FFE8C2",
      iconColor: "#7D4F07",
      textColor: "#3B2600",
      buttonLabel: o,
      buttonHref: i,
      fixedSize: l,
      LinkComponent: c,
      children: /* @__PURE__ */ b("div", { className: "mentor-insight-card", children: [
        /* @__PURE__ */ b("div", { className: "mentor-insight-card__profile", children: [
          /* @__PURE__ */ a("img", { src: s.avatarSrc, alt: "", className: "mentor-insight-card__avatar" }),
          /* @__PURE__ */ b("div", { className: "mentor-insight-card__info", children: [
            /* @__PURE__ */ a("span", { className: "mentor-insight-card__name", children: s.name }),
            /* @__PURE__ */ a("span", { className: "mentor-insight-card__role", children: s.role })
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "mentor-insight-card__match", children: [
          /* @__PURE__ */ a("span", { className: "material-symbols-outlined mentor-insight-card__match-icon", children: "track_changes" }),
          /* @__PURE__ */ a("span", { className: "mentor-insight-card__match-text", children: s.matchText }),
          s.matchCount > 0 && /* @__PURE__ */ b("span", { className: "mentor-insight-card__match-badge", children: [
            "+",
            s.matchCount
          ] })
        ] })
      ] })
    }
  );
}
function Je(e, t = []) {
  let n = [];
  function r(i, s) {
    const l = u.createContext(s), c = n.length;
    n = [...n, s];
    const f = (p) => {
      const { scope: m, children: g, ...v } = p, h = m?.[e]?.[c] || l, y = u.useMemo(() => v, Object.values(v));
      return /* @__PURE__ */ a(h.Provider, { value: y, children: g });
    };
    f.displayName = i + "Provider";
    function d(p, m) {
      const g = m?.[e]?.[c] || l, v = u.useContext(g);
      if (v) return v;
      if (s !== void 0) return s;
      throw new Error(`\`${p}\` must be used within \`${i}\``);
    }
    return [f, d];
  }
  const o = () => {
    const i = n.map((s) => u.createContext(s));
    return function(l) {
      const c = l?.[e] || i;
      return u.useMemo(
        () => ({ [`__scope${e}`]: { ...l, [e]: c } }),
        [l, c]
      );
    };
  };
  return o.scopeName = e, [r, vo(o, ...t)];
}
function vo(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map((o) => ({
      useScope: o(),
      scopeName: o.scopeName
    }));
    return function(i) {
      const s = r.reduce((l, { useScope: c, scopeName: f }) => {
        const p = c(i)[`__scope${f}`];
        return { ...l, ...p };
      }, {});
      return u.useMemo(() => ({ [`__scope${t.scopeName}`]: s }), [s]);
    };
  };
  return n.scopeName = t.scopeName, n;
}
function B(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(o) {
    if (e?.(o), n === !1 || !o.defaultPrevented)
      return t?.(o);
  };
}
var bo = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], H = bo.reduce((e, t) => {
  const n = We(`Primitive.${t}`), r = u.forwardRef((o, i) => {
    const { asChild: s, ...l } = o, c = s ? n : t;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ a(c, { ...l, ref: i });
  });
  return r.displayName = `Primitive.${t}`, { ...e, [t]: r };
}, {});
function xt(e, t) {
  e && Kn.flushSync(() => e.dispatchEvent(t));
}
var Q = globalThis?.document ? u.useLayoutEffect : () => {
}, yo = u[" useInsertionEffect ".trim().toString()] || Q;
function Bt({
  prop: e,
  defaultProp: t,
  onChange: n = () => {
  },
  caller: r
}) {
  const [o, i, s] = Co({
    defaultProp: t,
    onChange: n
  }), l = e !== void 0, c = l ? e : o;
  {
    const d = u.useRef(e !== void 0);
    u.useEffect(() => {
      const p = d.current;
      p !== l && console.warn(
        `${r} is changing from ${p ? "controlled" : "uncontrolled"} to ${l ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), d.current = l;
    }, [l, r]);
  }
  const f = u.useCallback(
    (d) => {
      if (l) {
        const p = _o(d) ? d(e) : d;
        p !== e && s.current?.(p);
      } else
        i(d);
    },
    [l, e, i, s]
  );
  return [c, f];
}
function Co({
  defaultProp: e,
  onChange: t
}) {
  const [n, r] = u.useState(e), o = u.useRef(n), i = u.useRef(t);
  return yo(() => {
    i.current = t;
  }, [t]), u.useEffect(() => {
    o.current !== n && (i.current?.(n), o.current = n);
  }, [n, o]), [n, r, i];
}
function _o(e) {
  return typeof e == "function";
}
function gn(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function Qn(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((o) => {
      const i = gn(o, t);
      return !n && typeof i == "function" && (n = !0), i;
    });
    if (n)
      return () => {
        for (let o = 0; o < r.length; o++) {
          const i = r[o];
          typeof i == "function" ? i() : gn(e[o], null);
        }
      };
  };
}
function U(...e) {
  return u.useCallback(Qn(...e), e);
}
var wo = u.createContext(void 0);
function xo(e) {
  const t = u.useContext(wo);
  return e || t || "ltr";
}
function No(e, t) {
  return u.useReducer((n, r) => t[n][r] ?? n, e);
}
var he = (e) => {
  const { present: t, children: n } = e, r = Lo(t), o = typeof n == "function" ? n({ present: r.isPresent }) : u.Children.only(n), i = U(r.ref, Eo(o));
  return typeof n == "function" || r.isPresent ? u.cloneElement(o, { ref: i }) : null;
};
he.displayName = "Presence";
function Lo(e) {
  const [t, n] = u.useState(), r = u.useRef(null), o = u.useRef(e), i = u.useRef("none"), s = e ? "mounted" : "unmounted", [l, c] = No(s, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return u.useEffect(() => {
    const f = Te(r.current);
    i.current = l === "mounted" ? f : "none";
  }, [l]), Q(() => {
    const f = r.current, d = o.current;
    if (d !== e) {
      const m = i.current, g = Te(f);
      e ? c("MOUNT") : g === "none" || f?.display === "none" ? c("UNMOUNT") : c(d && m !== g ? "ANIMATION_OUT" : "UNMOUNT"), o.current = e;
    }
  }, [e, c]), Q(() => {
    if (t) {
      let f;
      const d = t.ownerDocument.defaultView ?? window, p = (g) => {
        const h = Te(r.current).includes(CSS.escape(g.animationName));
        if (g.target === t && h && (c("ANIMATION_END"), !o.current)) {
          const y = t.style.animationFillMode;
          t.style.animationFillMode = "forwards", f = d.setTimeout(() => {
            t.style.animationFillMode === "forwards" && (t.style.animationFillMode = y);
          });
        }
      }, m = (g) => {
        g.target === t && (i.current = Te(r.current));
      };
      return t.addEventListener("animationstart", m), t.addEventListener("animationcancel", p), t.addEventListener("animationend", p), () => {
        d.clearTimeout(f), t.removeEventListener("animationstart", m), t.removeEventListener("animationcancel", p), t.removeEventListener("animationend", p);
      };
    } else
      c("ANIMATION_END");
  }, [t, c]), {
    isPresent: ["mounted", "unmountSuspended"].includes(l),
    ref: u.useCallback((f) => {
      r.current = f ? getComputedStyle(f) : null, n(f);
    }, [])
  };
}
function Te(e) {
  return e?.animationName || "none";
}
function Eo(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
var ko = u[" useId ".trim().toString()] || (() => {
}), So = 0;
function $t(e) {
  const [t, n] = u.useState(ko());
  return Q(() => {
    n((r) => r ?? String(So++));
  }, [e]), e || (t ? `radix-${t}` : "");
}
function Jn(e) {
  const t = e + "CollectionProvider", [n, r] = Je(t), [o, i] = n(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), s = (h) => {
    const { scope: y, children: C } = h, L = oe.useRef(null), _ = oe.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ a(o, { scope: y, itemMap: _, collectionRef: L, children: C });
  };
  s.displayName = t;
  const l = e + "CollectionSlot", c = We(l), f = oe.forwardRef(
    (h, y) => {
      const { scope: C, children: L } = h, _ = i(l, C), w = U(y, _.collectionRef);
      return /* @__PURE__ */ a(c, { ref: w, children: L });
    }
  );
  f.displayName = l;
  const d = e + "CollectionItemSlot", p = "data-radix-collection-item", m = We(d), g = oe.forwardRef(
    (h, y) => {
      const { scope: C, children: L, ..._ } = h, w = oe.useRef(null), E = U(y, w), k = i(d, C);
      return oe.useEffect(() => (k.itemMap.set(w, { ref: w, ..._ }), () => {
        k.itemMap.delete(w);
      })), /* @__PURE__ */ a(m, { [p]: "", ref: E, children: L });
    }
  );
  g.displayName = d;
  function v(h) {
    const y = i(e + "CollectionConsumer", h);
    return oe.useCallback(() => {
      const L = y.collectionRef.current;
      if (!L) return [];
      const _ = Array.from(L.querySelectorAll(`[${p}]`));
      return Array.from(y.itemMap.values()).sort(
        (k, S) => _.indexOf(k.ref.current) - _.indexOf(S.ref.current)
      );
    }, [y.collectionRef, y.itemMap]);
  }
  return [
    { Provider: s, Slot: f, ItemSlot: g },
    v,
    r
  ];
}
function G(e) {
  const t = u.useRef(e);
  return u.useEffect(() => {
    t.current = e;
  }), u.useMemo(() => (...n) => t.current?.(...n), []);
}
function Mo(e, t = globalThis?.document) {
  const n = G(e);
  u.useEffect(() => {
    const r = (o) => {
      o.key === "Escape" && n(o);
    };
    return t.addEventListener("keydown", r, { capture: !0 }), () => t.removeEventListener("keydown", r, { capture: !0 });
  }, [n, t]);
}
var Ro = "DismissableLayer", Nt = "dismissableLayer.update", Ao = "dismissableLayer.pointerDownOutside", Fo = "dismissableLayer.focusOutside", vn, er = u.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
}), Zt = u.forwardRef(
  (e, t) => {
    const {
      disableOutsidePointerEvents: n = !1,
      onEscapeKeyDown: r,
      onPointerDownOutside: o,
      onFocusOutside: i,
      onInteractOutside: s,
      onDismiss: l,
      ...c
    } = e, f = u.useContext(er), [d, p] = u.useState(null), m = d?.ownerDocument ?? globalThis?.document, [, g] = u.useState({}), v = U(t, (S) => p(S)), h = Array.from(f.layers), [y] = [...f.layersWithOutsidePointerEventsDisabled].slice(-1), C = h.indexOf(y), L = d ? h.indexOf(d) : -1, _ = f.layersWithOutsidePointerEventsDisabled.size > 0, w = L >= C, E = Oo((S) => {
      const F = S.target, R = [...f.branches].some((N) => N.contains(F));
      !w || R || (o?.(S), s?.(S), S.defaultPrevented || l?.());
    }, m), k = Do((S) => {
      const F = S.target;
      [...f.branches].some((N) => N.contains(F)) || (i?.(S), s?.(S), S.defaultPrevented || l?.());
    }, m);
    return Mo((S) => {
      L === f.layers.size - 1 && (r?.(S), !S.defaultPrevented && l && (S.preventDefault(), l()));
    }, m), u.useEffect(() => {
      if (d)
        return n && (f.layersWithOutsidePointerEventsDisabled.size === 0 && (vn = m.body.style.pointerEvents, m.body.style.pointerEvents = "none"), f.layersWithOutsidePointerEventsDisabled.add(d)), f.layers.add(d), bn(), () => {
          n && f.layersWithOutsidePointerEventsDisabled.size === 1 && (m.body.style.pointerEvents = vn);
        };
    }, [d, m, n, f]), u.useEffect(() => () => {
      d && (f.layers.delete(d), f.layersWithOutsidePointerEventsDisabled.delete(d), bn());
    }, [d, f]), u.useEffect(() => {
      const S = () => g({});
      return document.addEventListener(Nt, S), () => document.removeEventListener(Nt, S);
    }, []), /* @__PURE__ */ a(
      H.div,
      {
        ...c,
        ref: v,
        style: {
          pointerEvents: _ ? w ? "auto" : "none" : void 0,
          ...e.style
        },
        onFocusCapture: B(e.onFocusCapture, k.onFocusCapture),
        onBlurCapture: B(e.onBlurCapture, k.onBlurCapture),
        onPointerDownCapture: B(
          e.onPointerDownCapture,
          E.onPointerDownCapture
        )
      }
    );
  }
);
Zt.displayName = Ro;
var Po = "DismissableLayerBranch", To = u.forwardRef((e, t) => {
  const n = u.useContext(er), r = u.useRef(null), o = U(t, r);
  return u.useEffect(() => {
    const i = r.current;
    if (i)
      return n.branches.add(i), () => {
        n.branches.delete(i);
      };
  }, [n.branches]), /* @__PURE__ */ a(H.div, { ...e, ref: o });
});
To.displayName = Po;
function Oo(e, t = globalThis?.document) {
  const n = G(e), r = u.useRef(!1), o = u.useRef(() => {
  });
  return u.useEffect(() => {
    const i = (l) => {
      if (l.target && !r.current) {
        let c = function() {
          tr(
            Ao,
            n,
            f,
            { discrete: !0 }
          );
        };
        const f = { originalEvent: l };
        l.pointerType === "touch" ? (t.removeEventListener("click", o.current), o.current = c, t.addEventListener("click", o.current, { once: !0 })) : c();
      } else
        t.removeEventListener("click", o.current);
      r.current = !1;
    }, s = window.setTimeout(() => {
      t.addEventListener("pointerdown", i);
    }, 0);
    return () => {
      window.clearTimeout(s), t.removeEventListener("pointerdown", i), t.removeEventListener("click", o.current);
    };
  }, [t, n]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => r.current = !0
  };
}
function Do(e, t = globalThis?.document) {
  const n = G(e), r = u.useRef(!1);
  return u.useEffect(() => {
    const o = (i) => {
      i.target && !r.current && tr(Fo, n, { originalEvent: i }, {
        discrete: !1
      });
    };
    return t.addEventListener("focusin", o), () => t.removeEventListener("focusin", o);
  }, [t, n]), {
    onFocusCapture: () => r.current = !0,
    onBlurCapture: () => r.current = !1
  };
}
function bn() {
  const e = new CustomEvent(Nt);
  document.dispatchEvent(e);
}
function tr(e, t, n, { discrete: r }) {
  const o = n.originalEvent.target, i = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  t && o.addEventListener(e, t, { once: !0 }), r ? xt(o, i) : o.dispatchEvent(i);
}
function Io(e) {
  const t = u.useRef({ value: e, previous: e });
  return u.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
var Vo = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}), Bo = "VisuallyHidden", nr = u.forwardRef(
  (e, t) => /* @__PURE__ */ a(
    H.span,
    {
      ...e,
      ref: t,
      style: { ...Vo, ...e.style }
    }
  )
);
nr.displayName = Bo;
var $o = nr, ge = "NavigationMenu", [Ht, rr, Zo] = Jn(ge), [Lt, Ho, jo] = Jn(ge), [jt] = Je(
  ge,
  [Zo, jo]
), [Wo, q] = jt(ge), [zo, Uo] = jt(ge), ar = u.forwardRef(
  (e, t) => {
    const {
      __scopeNavigationMenu: n,
      value: r,
      onValueChange: o,
      defaultValue: i,
      delayDuration: s = 200,
      skipDelayDuration: l = 300,
      orientation: c = "horizontal",
      dir: f,
      ...d
    } = e, [p, m] = u.useState(null), g = U(t, (R) => m(R)), v = xo(f), h = u.useRef(0), y = u.useRef(0), C = u.useRef(0), [L, _] = u.useState(!0), [w, E] = Bt({
      prop: r,
      onChange: (R) => {
        const N = R !== "", P = l > 0;
        N ? (window.clearTimeout(C.current), P && _(!1)) : (window.clearTimeout(C.current), C.current = window.setTimeout(
          () => _(!0),
          l
        )), o?.(R);
      },
      defaultProp: i ?? "",
      caller: ge
    }), k = u.useCallback(() => {
      window.clearTimeout(y.current), y.current = window.setTimeout(() => E(""), 150);
    }, [E]), S = u.useCallback(
      (R) => {
        window.clearTimeout(y.current), E(R);
      },
      [E]
    ), F = u.useCallback(
      (R) => {
        w === R ? window.clearTimeout(y.current) : h.current = window.setTimeout(() => {
          window.clearTimeout(y.current), E(R);
        }, s);
      },
      [w, E, s]
    );
    return u.useEffect(() => () => {
      window.clearTimeout(h.current), window.clearTimeout(y.current), window.clearTimeout(C.current);
    }, []), /* @__PURE__ */ a(
      or,
      {
        scope: n,
        isRootMenu: !0,
        value: w,
        dir: v,
        orientation: c,
        rootNavigationMenu: p,
        onTriggerEnter: (R) => {
          window.clearTimeout(h.current), L ? F(R) : S(R);
        },
        onTriggerLeave: () => {
          window.clearTimeout(h.current), k();
        },
        onContentEnter: () => window.clearTimeout(y.current),
        onContentLeave: k,
        onItemSelect: (R) => {
          E((N) => N === R ? "" : R);
        },
        onItemDismiss: () => E(""),
        children: /* @__PURE__ */ a(
          H.nav,
          {
            "aria-label": "Main",
            "data-orientation": c,
            dir: v,
            ...d,
            ref: g
          }
        )
      }
    );
  }
);
ar.displayName = ge;
var Et = "NavigationMenuSub", Ko = u.forwardRef(
  (e, t) => {
    const {
      __scopeNavigationMenu: n,
      value: r,
      onValueChange: o,
      defaultValue: i,
      orientation: s = "horizontal",
      ...l
    } = e, c = q(Et, n), [f, d] = Bt({
      prop: r,
      onChange: o,
      defaultProp: i ?? "",
      caller: Et
    });
    return /* @__PURE__ */ a(
      or,
      {
        scope: n,
        isRootMenu: !1,
        value: f,
        dir: c.dir,
        orientation: s,
        rootNavigationMenu: c.rootNavigationMenu,
        onTriggerEnter: (p) => d(p),
        onItemSelect: (p) => d(p),
        onItemDismiss: () => d(""),
        children: /* @__PURE__ */ a(H.div, { "data-orientation": s, ...l, ref: t })
      }
    );
  }
);
Ko.displayName = Et;
var or = (e) => {
  const {
    scope: t,
    isRootMenu: n,
    rootNavigationMenu: r,
    dir: o,
    orientation: i,
    children: s,
    value: l,
    onItemSelect: c,
    onItemDismiss: f,
    onTriggerEnter: d,
    onTriggerLeave: p,
    onContentEnter: m,
    onContentLeave: g
  } = e, [v, h] = u.useState(null), [y, C] = u.useState(/* @__PURE__ */ new Map()), [L, _] = u.useState(null);
  return /* @__PURE__ */ a(
    Wo,
    {
      scope: t,
      isRootMenu: n,
      rootNavigationMenu: r,
      value: l,
      previousValue: Io(l),
      baseId: $t(),
      dir: o,
      orientation: i,
      viewport: v,
      onViewportChange: h,
      indicatorTrack: L,
      onIndicatorTrackChange: _,
      onTriggerEnter: G(d),
      onTriggerLeave: G(p),
      onContentEnter: G(m),
      onContentLeave: G(g),
      onItemSelect: G(c),
      onItemDismiss: G(f),
      onViewportContentChange: u.useCallback((w, E) => {
        C((k) => (k.set(w, E), new Map(k)));
      }, []),
      onViewportContentRemove: u.useCallback((w) => {
        C((E) => E.has(w) ? (E.delete(w), new Map(E)) : E);
      }, []),
      children: /* @__PURE__ */ a(Ht.Provider, { scope: t, children: /* @__PURE__ */ a(zo, { scope: t, items: y, children: s }) })
    }
  );
}, ir = "NavigationMenuList", sr = u.forwardRef(
  (e, t) => {
    const { __scopeNavigationMenu: n, ...r } = e, o = q(ir, n), i = /* @__PURE__ */ a(H.ul, { "data-orientation": o.orientation, ...r, ref: t });
    return /* @__PURE__ */ a(H.div, { style: { position: "relative" }, ref: o.onIndicatorTrackChange, children: /* @__PURE__ */ a(Ht.Slot, { scope: n, children: o.isRootMenu ? /* @__PURE__ */ a(gr, { asChild: !0, children: i }) : i }) });
  }
);
sr.displayName = ir;
var lr = "NavigationMenuItem", [Go, cr] = jt(lr), dr = u.forwardRef(
  (e, t) => {
    const { __scopeNavigationMenu: n, value: r, ...o } = e, i = $t(), s = r || i || "LEGACY_REACT_AUTO_VALUE", l = u.useRef(null), c = u.useRef(null), f = u.useRef(null), d = u.useRef(() => {
    }), p = u.useRef(!1), m = u.useCallback((v = "start") => {
      if (l.current) {
        d.current();
        const h = St(l.current);
        h.length && Ut(v === "start" ? h : h.reverse());
      }
    }, []), g = u.useCallback(() => {
      if (l.current) {
        const v = St(l.current);
        v.length && (d.current = ni(v));
      }
    }, []);
    return /* @__PURE__ */ a(
      Go,
      {
        scope: n,
        value: s,
        triggerRef: c,
        contentRef: l,
        focusProxyRef: f,
        wasEscapeCloseRef: p,
        onEntryKeyDown: m,
        onFocusProxyEnter: m,
        onRootContentClose: g,
        onContentFocusOutside: g,
        children: /* @__PURE__ */ a(H.li, { ...o, ref: t })
      }
    );
  }
);
dr.displayName = lr;
var kt = "NavigationMenuTrigger", ur = u.forwardRef((e, t) => {
  const { __scopeNavigationMenu: n, disabled: r, ...o } = e, i = q(kt, e.__scopeNavigationMenu), s = cr(kt, e.__scopeNavigationMenu), l = u.useRef(null), c = U(l, s.triggerRef, t), f = br(i.baseId, s.value), d = yr(i.baseId, s.value), p = u.useRef(!1), m = u.useRef(!1), g = s.value === i.value;
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a(Ht.ItemSlot, { scope: n, value: s.value, children: /* @__PURE__ */ a(vr, { asChild: !0, children: /* @__PURE__ */ a(
      H.button,
      {
        id: f,
        disabled: r,
        "data-disabled": r ? "" : void 0,
        "data-state": Kt(g),
        "aria-expanded": g,
        "aria-controls": d,
        ...o,
        ref: c,
        onPointerEnter: B(e.onPointerEnter, () => {
          m.current = !1, s.wasEscapeCloseRef.current = !1;
        }),
        onPointerMove: B(
          e.onPointerMove,
          ze(() => {
            r || m.current || s.wasEscapeCloseRef.current || p.current || (i.onTriggerEnter(s.value), p.current = !0);
          })
        ),
        onPointerLeave: B(
          e.onPointerLeave,
          ze(() => {
            r || (i.onTriggerLeave(), p.current = !1);
          })
        ),
        onClick: B(e.onClick, () => {
          i.onItemSelect(s.value), m.current = g;
        }),
        onKeyDown: B(e.onKeyDown, (v) => {
          const y = { horizontal: "ArrowDown", vertical: i.dir === "rtl" ? "ArrowLeft" : "ArrowRight" }[i.orientation];
          g && v.key === y && (s.onEntryKeyDown(), v.preventDefault());
        })
      }
    ) }) }),
    g && /* @__PURE__ */ b(V, { children: [
      /* @__PURE__ */ a(
        $o,
        {
          "aria-hidden": !0,
          tabIndex: 0,
          ref: s.focusProxyRef,
          onFocus: (v) => {
            const h = s.contentRef.current, y = v.relatedTarget, C = y === l.current, L = h?.contains(y);
            (C || !L) && s.onFocusProxyEnter(C ? "start" : "end");
          }
        }
      ),
      i.viewport && /* @__PURE__ */ a("span", { "aria-owns": d })
    ] })
  ] });
});
ur.displayName = kt;
var Yo = "NavigationMenuLink", yn = "navigationMenu.linkSelect", fr = u.forwardRef(
  (e, t) => {
    const { __scopeNavigationMenu: n, active: r, onSelect: o, ...i } = e;
    return /* @__PURE__ */ a(vr, { asChild: !0, children: /* @__PURE__ */ a(
      H.a,
      {
        "data-active": r ? "" : void 0,
        "aria-current": r ? "page" : void 0,
        ...i,
        ref: t,
        onClick: B(
          e.onClick,
          (s) => {
            const l = s.target, c = new CustomEvent(yn, {
              bubbles: !0,
              cancelable: !0
            });
            if (l.addEventListener(yn, (f) => o?.(f), { once: !0 }), xt(l, c), !c.defaultPrevented && !s.metaKey) {
              const f = new CustomEvent($e, {
                bubbles: !0,
                cancelable: !0
              });
              xt(l, f);
            }
          },
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
fr.displayName = Yo;
var Wt = "NavigationMenuIndicator", Xo = u.forwardRef((e, t) => {
  const { forceMount: n, ...r } = e, o = q(Wt, e.__scopeNavigationMenu), i = !!o.value;
  return o.indicatorTrack ? Gn.createPortal(
    /* @__PURE__ */ a(he, { present: n || i, children: /* @__PURE__ */ a(qo, { ...r, ref: t }) }),
    o.indicatorTrack
  ) : null;
});
Xo.displayName = Wt;
var qo = u.forwardRef((e, t) => {
  const { __scopeNavigationMenu: n, ...r } = e, o = q(Wt, n), i = rr(n), [s, l] = u.useState(
    null
  ), [c, f] = u.useState(null), d = o.orientation === "horizontal", p = !!o.value;
  u.useEffect(() => {
    const v = i().find((h) => h.value === o.value)?.ref.current;
    v && l(v);
  }, [i, o.value]);
  const m = () => {
    s && f({
      size: d ? s.offsetWidth : s.offsetHeight,
      offset: d ? s.offsetLeft : s.offsetTop
    });
  };
  return Mt(s, m), Mt(o.indicatorTrack, m), c ? /* @__PURE__ */ a(
    H.div,
    {
      "aria-hidden": !0,
      "data-state": p ? "visible" : "hidden",
      "data-orientation": o.orientation,
      ...r,
      ref: t,
      style: {
        position: "absolute",
        ...d ? {
          left: 0,
          width: c.size + "px",
          transform: `translateX(${c.offset}px)`
        } : {
          top: 0,
          height: c.size + "px",
          transform: `translateY(${c.offset}px)`
        },
        ...r.style
      }
    }
  ) : null;
}), xe = "NavigationMenuContent", pr = u.forwardRef((e, t) => {
  const { forceMount: n, ...r } = e, o = q(xe, e.__scopeNavigationMenu), i = cr(xe, e.__scopeNavigationMenu), s = U(i.contentRef, t), l = i.value === o.value, c = {
    value: i.value,
    triggerRef: i.triggerRef,
    focusProxyRef: i.focusProxyRef,
    wasEscapeCloseRef: i.wasEscapeCloseRef,
    onContentFocusOutside: i.onContentFocusOutside,
    onRootContentClose: i.onRootContentClose,
    ...r
  };
  return o.viewport ? /* @__PURE__ */ a(Qo, { forceMount: n, ...c, ref: s }) : /* @__PURE__ */ a(he, { present: n || l, children: /* @__PURE__ */ a(
    mr,
    {
      "data-state": Kt(l),
      ...c,
      ref: s,
      onPointerEnter: B(e.onPointerEnter, o.onContentEnter),
      onPointerLeave: B(
        e.onPointerLeave,
        ze(o.onContentLeave)
      ),
      style: {
        // Prevent interaction when animating out
        pointerEvents: !l && o.isRootMenu ? "none" : void 0,
        ...c.style
      }
    }
  ) });
});
pr.displayName = xe;
var Qo = u.forwardRef((e, t) => {
  const n = q(xe, e.__scopeNavigationMenu), { onViewportContentChange: r, onViewportContentRemove: o } = n;
  return Q(() => {
    r(e.value, {
      ref: t,
      ...e
    });
  }, [e, t, r]), Q(() => () => o(e.value), [e.value, o]), null;
}), $e = "navigationMenu.rootContentDismiss", mr = u.forwardRef((e, t) => {
  const {
    __scopeNavigationMenu: n,
    value: r,
    triggerRef: o,
    focusProxyRef: i,
    wasEscapeCloseRef: s,
    onRootContentClose: l,
    onContentFocusOutside: c,
    ...f
  } = e, d = q(xe, n), p = u.useRef(null), m = U(p, t), g = br(d.baseId, r), v = yr(d.baseId, r), h = rr(n), y = u.useRef(null), { onItemDismiss: C } = d;
  u.useEffect(() => {
    const _ = p.current;
    if (d.isRootMenu && _) {
      const w = () => {
        C(), l(), _.contains(document.activeElement) && o.current?.focus();
      };
      return _.addEventListener($e, w), () => _.removeEventListener($e, w);
    }
  }, [d.isRootMenu, e.value, o, C, l]);
  const L = u.useMemo(() => {
    const w = h().map((N) => N.value);
    d.dir === "rtl" && w.reverse();
    const E = w.indexOf(d.value), k = w.indexOf(d.previousValue), S = r === d.value, F = k === w.indexOf(r);
    if (!S && !F) return y.current;
    const R = (() => {
      if (E !== k) {
        if (S && k !== -1) return E > k ? "from-end" : "from-start";
        if (F && E !== -1) return E > k ? "to-start" : "to-end";
      }
      return null;
    })();
    return y.current = R, R;
  }, [d.previousValue, d.value, d.dir, h, r]);
  return /* @__PURE__ */ a(gr, { asChild: !0, children: /* @__PURE__ */ a(
    Zt,
    {
      id: v,
      "aria-labelledby": g,
      "data-motion": L,
      "data-orientation": d.orientation,
      ...f,
      ref: m,
      disableOutsidePointerEvents: !1,
      onDismiss: () => {
        const _ = new Event($e, {
          bubbles: !0,
          cancelable: !0
        });
        p.current?.dispatchEvent(_);
      },
      onFocusOutside: B(e.onFocusOutside, (_) => {
        c();
        const w = _.target;
        d.rootNavigationMenu?.contains(w) && _.preventDefault();
      }),
      onPointerDownOutside: B(e.onPointerDownOutside, (_) => {
        const w = _.target, E = h().some((S) => S.ref.current?.contains(w)), k = d.isRootMenu && d.viewport?.contains(w);
        (E || k || !d.isRootMenu) && _.preventDefault();
      }),
      onKeyDown: B(e.onKeyDown, (_) => {
        const w = _.altKey || _.ctrlKey || _.metaKey;
        if (_.key === "Tab" && !w) {
          const k = St(_.currentTarget), S = document.activeElement, F = k.findIndex((P) => P === S), N = _.shiftKey ? k.slice(0, F).reverse() : k.slice(F + 1, k.length);
          Ut(N) ? _.preventDefault() : i.current?.focus();
        }
      }),
      onEscapeKeyDown: B(e.onEscapeKeyDown, (_) => {
        s.current = !0;
      })
    }
  ) });
}), zt = "NavigationMenuViewport", hr = u.forwardRef((e, t) => {
  const { forceMount: n, ...r } = e, i = !!q(zt, e.__scopeNavigationMenu).value;
  return /* @__PURE__ */ a(he, { present: n || i, children: /* @__PURE__ */ a(Jo, { ...r, ref: t }) });
});
hr.displayName = zt;
var Jo = u.forwardRef((e, t) => {
  const { __scopeNavigationMenu: n, children: r, ...o } = e, i = q(zt, n), s = U(t, i.onViewportChange), l = Uo(
    xe,
    e.__scopeNavigationMenu
  ), [c, f] = u.useState(null), [d, p] = u.useState(null), m = c ? c?.width + "px" : void 0, g = c ? c?.height + "px" : void 0, v = !!i.value, h = v ? i.value : i.previousValue;
  return Mt(d, () => {
    d && f({ width: d.offsetWidth, height: d.offsetHeight });
  }), /* @__PURE__ */ a(
    H.div,
    {
      "data-state": Kt(v),
      "data-orientation": i.orientation,
      ...o,
      ref: s,
      style: {
        // Prevent interaction when animating out
        pointerEvents: !v && i.isRootMenu ? "none" : void 0,
        "--radix-navigation-menu-viewport-width": m,
        "--radix-navigation-menu-viewport-height": g,
        ...o.style
      },
      onPointerEnter: B(e.onPointerEnter, i.onContentEnter),
      onPointerLeave: B(e.onPointerLeave, ze(i.onContentLeave)),
      children: Array.from(l.items).map(([C, { ref: L, forceMount: _, ...w }]) => {
        const E = h === C;
        return /* @__PURE__ */ a(he, { present: _ || E, children: /* @__PURE__ */ a(
          mr,
          {
            ...w,
            ref: Qn(L, (k) => {
              E && k && p(k);
            })
          }
        ) }, C);
      })
    }
  );
}), ei = "FocusGroup", gr = u.forwardRef(
  (e, t) => {
    const { __scopeNavigationMenu: n, ...r } = e, o = q(ei, n);
    return /* @__PURE__ */ a(Lt.Provider, { scope: n, children: /* @__PURE__ */ a(Lt.Slot, { scope: n, children: /* @__PURE__ */ a(H.div, { dir: o.dir, ...r, ref: t }) }) });
  }
), Cn = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"], ti = "FocusGroupItem", vr = u.forwardRef(
  (e, t) => {
    const { __scopeNavigationMenu: n, ...r } = e, o = Ho(n), i = q(ti, n);
    return /* @__PURE__ */ a(Lt.ItemSlot, { scope: n, children: /* @__PURE__ */ a(
      H.button,
      {
        ...r,
        ref: t,
        onKeyDown: B(e.onKeyDown, (s) => {
          if (["Home", "End", ...Cn].includes(s.key)) {
            let c = o().map((p) => p.ref.current);
            if ([i.dir === "rtl" ? "ArrowRight" : "ArrowLeft", "ArrowUp", "End"].includes(s.key) && c.reverse(), Cn.includes(s.key)) {
              const p = c.indexOf(s.currentTarget);
              c = c.slice(p + 1);
            }
            setTimeout(() => Ut(c)), s.preventDefault();
          }
        })
      }
    ) });
  }
);
function St(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const o = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || o ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Ut(e) {
  const t = document.activeElement;
  return e.some((n) => n === t ? !0 : (n.focus(), document.activeElement !== t));
}
function ni(e) {
  return e.forEach((t) => {
    t.dataset.tabindex = t.getAttribute("tabindex") || "", t.setAttribute("tabindex", "-1");
  }), () => {
    e.forEach((t) => {
      const n = t.dataset.tabindex;
      t.setAttribute("tabindex", n);
    });
  };
}
function Mt(e, t) {
  const n = G(t);
  Q(() => {
    let r = 0;
    if (e) {
      const o = new ResizeObserver(() => {
        cancelAnimationFrame(r), r = window.requestAnimationFrame(n);
      });
      return o.observe(e), () => {
        window.cancelAnimationFrame(r), o.unobserve(e);
      };
    }
  }, [e, n]);
}
function Kt(e) {
  return e ? "open" : "closed";
}
function br(e, t) {
  return `${e}-trigger-${t}`;
}
function yr(e, t) {
  return `${e}-content-${t}`;
}
function ze(e) {
  return (t) => t.pointerType === "mouse" ? e(t) : void 0;
}
var ri = ar, ai = sr, oi = dr, ii = ur, si = fr, _n = pr, li = hr;
const Cr = u.createContext(!0);
function ci({
  className: e,
  children: t,
  viewport: n = !0,
  variant: r = "underline",
  ...o
}) {
  return /* @__PURE__ */ a(Cr.Provider, { value: n, children: /* @__PURE__ */ b(
    ri,
    {
      "data-slot": "navigation-menu",
      "data-viewport": n,
      "data-variant": r,
      className: x("nav-menu", `nav-menu--${r}`, e),
      ...o,
      children: [
        t,
        n && /* @__PURE__ */ a(ui, {})
      ]
    }
  ) });
}
function di({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    ai,
    {
      "data-slot": "navigation-menu-list",
      className: x("nav-menu__list", e),
      ...t
    }
  );
}
const Gt = u.createContext(null);
function lt({
  className: e,
  ...t
}) {
  const n = u.useRef(null);
  return /* @__PURE__ */ a(Gt.Provider, { value: n, children: /* @__PURE__ */ a(
    oi,
    {
      "data-slot": "navigation-menu-item",
      className: x("nav-menu__item", e),
      ...t
    }
  ) });
}
function ct(e) {
  e.preventDefault();
}
function cd({
  className: e,
  children: t,
  onPointerMove: n,
  onPointerLeave: r,
  onPointerEnter: o,
  onPointerMoveCapture: i,
  ref: s,
  ...l
}) {
  const c = u.useContext(Gt), f = u.useCallback(
    (d) => {
      c && (c.current = d), typeof s == "function" ? s(d) : s && (s.current = d);
    },
    [s, c]
  );
  return /* @__PURE__ */ a(
    ii,
    {
      "data-slot": "navigation-menu-trigger",
      className: x("nav-menu__trigger", e),
      ref: f,
      onPointerMoveCapture: (d) => {
        ct(d), i?.(d);
      },
      onPointerLeave: (d) => {
        ct(d), r?.(d);
      },
      onPointerEnter: (d) => {
        ct(d), o?.(d);
      },
      onPointerMove: n,
      ...l,
      children: /* @__PURE__ */ b("span", { className: "nav-menu__trigger-label", children: [
        t,
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined nav-menu__chevron", "aria-hidden": !0, children: "expand_more" })
      ] })
    }
  );
}
function dd({
  className: e,
  children: t,
  forceMount: n,
  ...r
}) {
  const o = u.useContext(Cr), i = u.useContext(Gt), s = u.useRef(null), [l, c] = u.useState({}), [f, d] = u.useState(!1), p = u.useCallback(() => {
    const m = i?.current;
    if (!m) return;
    const g = m.getBoundingClientRect(), v = m.closest?.(".navbar"), h = v ? v.getBoundingClientRect().bottom + 2 : g.bottom + 2;
    c({
      position: "fixed",
      top: h,
      left: g.left,
      minWidth: 200,
      zIndex: 1100,
      transform: "translateZ(0)"
    });
  }, [i]);
  return u.useLayoutEffect(() => {
    if (o || !i) return;
    const m = s.current, g = i.current, v = () => {
      const y = g?.getAttribute?.("aria-expanded") === "true", C = m?.querySelector?.('[data-state="open"]') != null || m?.firstElementChild?.getAttribute?.("data-state") === "open", L = y || C;
      d(L), L && p();
    };
    if (v(), !g && !m) return;
    const h = new MutationObserver(v);
    return g && h.observe(g, { attributes: !0, attributeFilter: ["aria-expanded"] }), m && h.observe(m, { attributes: !0, attributeFilter: ["data-state"], subtree: !0 }), () => h.disconnect();
  }, [o, i, p]), u.useEffect(() => {
    if (!f || o) return;
    p();
    const m = requestAnimationFrame(() => p());
    return window.addEventListener("scroll", p, !0), window.addEventListener("resize", p), () => {
      cancelAnimationFrame(m), window.removeEventListener("scroll", p, !0), window.removeEventListener("resize", p);
    };
  }, [f, o, p]), o ? /* @__PURE__ */ a(
    _n,
    {
      "data-slot": "navigation-menu-content",
      className: x("nav-menu__content", e),
      ...r
    }
  ) : /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("div", { ref: s, style: { display: "contents" }, "aria-hidden": !0, children: /* @__PURE__ */ a(
      _n,
      {
        "data-slot": "navigation-menu-content",
        className: x("nav-menu__content", e),
        forceMount: !0,
        style: { position: "absolute", visibility: "hidden", pointerEvents: "none", top: 0, left: 0, minWidth: 0 },
        ...r,
        children: /* @__PURE__ */ a("span", { "aria-hidden": !0, style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" } })
      }
    ) }),
    typeof document < "u" && f && $a(
      /* @__PURE__ */ a(
        "div",
        {
          className: x("nav-menu__content--portal", e),
          "data-slot": "navigation-menu-content",
          style: {
            ...l,
            padding: 0,
            boxSizing: "border-box",
            overflow: "visible"
          },
          children: t
        }
      ),
      document.body
    )
  ] });
}
function ui({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a("div", { className: "nav-menu__viewport-wrap", children: /* @__PURE__ */ a(
    li,
    {
      "data-slot": "navigation-menu-viewport",
      className: x("nav-menu__viewport", e),
      ...t
    }
  ) });
}
function dt({
  className: e,
  active: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ a(
    si,
    {
      "data-slot": "navigation-menu-link",
      "data-active": t ? "true" : void 0,
      className: x("nav-menu__link", e),
      ...r,
      children: r.asChild ? n : /* @__PURE__ */ a("span", { className: "nav-menu__link-label", children: n })
    }
  );
}
function ud({
  className: e,
  orientation: t = "horizontal",
  ...n
}) {
  return /* @__PURE__ */ a(
    Qe.Root,
    {
      "data-slot": "tabs",
      "data-orientation": t,
      orientation: t,
      className: x(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        e
      ),
      ...n
    }
  );
}
const fi = qe(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-[var(--radius-8,24px)] p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function fd({
  className: e,
  variant: t = "default",
  ...n
}) {
  return /* @__PURE__ */ a(
    Qe.List,
    {
      "data-slot": "tabs-list",
      "data-variant": t,
      className: x(fi({ variant: t }), e),
      ...n
    }
  );
}
function pd({
  className: e,
  leadingIcon: t,
  badge: n,
  children: r,
  ...o
}) {
  return /* @__PURE__ */ b(
    Qe.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: x(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-7,20px)] border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-[var(--color-blue-20,#BCE4FF)] group-data-[variant=default]/tabs-list:data-[state=active]:text-[var(--color-secondary-blue)] group-data-[variant=default]/tabs-list:data-[state=active]:border-transparent dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground group-data-[variant=line]/tabs-list:data-[state=active]:text-[var(--color-secondary-blue)]",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:after:left-2 group-data-[variant=line]/tabs-list:after:right-2 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100 group-data-[variant=line]/tabs-list:data-[state=active]:after:bg-[var(--color-secondary-blue)]",
        e
      ),
      ...o,
      children: [
        t && /* @__PURE__ */ a("span", { className: "shrink-0 [&_svg]:size-4", children: t }),
        r,
        n != null && /* @__PURE__ */ a("span", { "data-slot": "tabs-badge", className: "ml-1.5 h-6 min-w-6 rounded-xl px-1.5 text-center text-xs font-medium tabular-nums inline-flex items-center justify-center bg-muted text-muted-foreground", children: n > 99 ? "99+" : n })
      ]
    }
  );
}
function md({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    Qe.Content,
    {
      "data-slot": "tabs-content",
      className: x("flex-1 outline-none", e),
      ...t
    }
  );
}
function hd({
  className: e,
  bordered: t,
  children: n,
  ...r
}) {
  const o = /* @__PURE__ */ a("div", { "data-slot": "data-table-scroll", className: "relative w-full overflow-x-auto [-webkit-overflow-scrolling:touch]", children: /* @__PURE__ */ a(
    "table",
    {
      "data-slot": "data-table",
      className: x("w-full border-collapse text-sm", e),
      ...r,
      children: n
    }
  ) });
  return t ? /* @__PURE__ */ a("div", { "data-slot": "data-table-bordered", className: "rounded-xl border border-[#e5e7eb] bg-white overflow-hidden", children: o }) : o;
}
function gd({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "thead",
    {
      "data-slot": "data-table-header",
      className: x("[&_tr]:border-b", e),
      ...t
    }
  );
}
function vd({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "tbody",
    {
      "data-slot": "data-table-body",
      className: x("[&_tr:last-child]:border-0", e),
      ...t
    }
  );
}
function bd({
  className: e,
  variant: t = "default",
  onClick: n,
  ...r
}) {
  return /* @__PURE__ */ a(
    "tr",
    {
      "data-slot": "data-table-row",
      className: x(
        "border-b border-[#f1f5f9] transition-colors",
        t === "warn" && "",
        n && "cursor-pointer hover:bg-[#fafbff]",
        !n && "hover:bg-muted/50",
        e
      ),
      onClick: n,
      ...r
    }
  );
}
function yd({
  className: e,
  align: t,
  numeric: n,
  metric: r,
  shrink: o,
  sortable: i,
  sorted: s,
  onSort: l,
  children: c,
  ...f
}) {
  const d = t ?? (n ? "right" : "left"), p = s === "asc" ? "arrow_upward" : s === "desc" ? "arrow_downward" : "unfold_more";
  return /* @__PURE__ */ a(
    "th",
    {
      "data-slot": "data-table-head",
      "aria-sort": i ? s === "asc" ? "ascending" : s === "desc" ? "descending" : "none" : void 0,
      className: x(
        "px-5 py-2.5 text-left font-[var(--typography-caption-semibold)] text-[color:#64748b] uppercase tracking-[0.05em] text-xs font-semibold bg-[#f8fafc] whitespace-nowrap",
        d === "right" && "text-right",
        r && "min-w-[108px]",
        o && "w-[1%] pl-3 pr-5",
        i && "cursor-pointer select-none",
        e
      ),
      onClick: i ? l : void 0,
      ...f,
      children: i ? /* @__PURE__ */ b("span", { className: "inline-flex items-center gap-1", children: [
        c,
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: 14, opacity: s ? 1 : 0.4 }, children: p })
      ] }) : c
    }
  );
}
function Cd({
  className: e,
  align: t = "left",
  metric: n,
  numeric: r,
  ...o
}) {
  return /* @__PURE__ */ a(
    "td",
    {
      "data-slot": "data-table-cell",
      className: x(
        "px-5 py-3 align-middle whitespace-nowrap text-sm text-[#0f172a]",
        t === "right" && "text-right",
        n && "min-w-[108px]",
        r && "tabular-nums",
        e
      ),
      ...o
    }
  );
}
function _d({
  ...e
}) {
  return /* @__PURE__ */ a(z.Root, { "data-slot": "select", ...e });
}
function wd({
  ...e
}) {
  return /* @__PURE__ */ a(z.Group, { "data-slot": "select-group", ...e });
}
function xd({
  ...e
}) {
  return /* @__PURE__ */ a(z.Value, { "data-slot": "select-value", ...e });
}
const pi = {
  default: "border-transparent bg-[rgba(235,247,255,1)] text-[var(--color-button-primary-text)] hover:bg-[rgba(220,240,255,1)] focus-visible:bg-[rgba(220,240,255,1)] data-[placeholder]:text-[var(--color-button-primary-text)]/70 [&_svg]:opacity-80",
  primary: "border-transparent bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] hover:bg-[var(--color-button-primary-bg-hover)] focus-visible:bg-[var(--color-button-primary-bg-hover)] data-[placeholder]:text-[var(--color-button-primary-text)] [&_svg]:opacity-80",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:bg-secondary/80 dark:hover:bg-secondary/80 dark:focus-visible:bg-secondary/80 data-[placeholder]:text-secondary-foreground/70 [&_svg]:text-secondary-foreground/80",
  outline: "border border-input bg-transparent text-foreground hover:bg-accent/50 focus-visible:bg-accent/50 dark:bg-input/30 dark:hover:bg-input/50 dark:focus-visible:bg-input/50 data-[placeholder]:text-muted-foreground [&_svg]:text-muted-foreground"
}, mi = {
  default: "h-9 min-h-9 px-3 py-2 [&_svg]:size-4",
  sm: "h-8 min-h-8 px-2.5 py-1.5 [&_svg]:size-3.5"
}, hi = {
  default: void 0,
  sm: { height: 32, minHeight: 32, paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10, fontSize: "0.75rem" }
};
function Nd({
  className: e,
  size: t = "default",
  variant: n = "default",
  children: r,
  ...o
}) {
  const i = t === "small" ? "sm" : t;
  return /* @__PURE__ */ b(
    z.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": i,
      "data-variant": n,
      style: hi[i],
      className: x(
        "flex w-fit items-center justify-between gap-2 rounded-[var(--radius-8)] border whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        mi[i],
        pi[n],
        e
      ),
      ...o,
      children: [
        r,
        /* @__PURE__ */ a(z.Icon, { asChild: !0, children: /* @__PURE__ */ a(Yn, { className: "opacity-50" }) })
      ]
    }
  );
}
function Ld({
  className: e,
  children: t,
  position: n = "item-aligned",
  align: r = "center",
  ...o
}) {
  return /* @__PURE__ */ a(z.Portal, { children: /* @__PURE__ */ b(
    z.Content,
    {
      "data-slot": "select-content",
      className: x(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-[var(--radius-8)] border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        e
      ),
      position: n,
      align: r,
      ...o,
      children: [
        /* @__PURE__ */ a(gi, {}),
        /* @__PURE__ */ a(
          z.Viewport,
          {
            className: x(
              "p-1",
              n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children: t
          }
        ),
        /* @__PURE__ */ a(vi, {})
      ]
    }
  ) });
}
function Ed({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    z.Label,
    {
      "data-slot": "select-label",
      className: x("px-2 py-1.5 text-foreground", e),
      ...t
    }
  );
}
function kd({
  className: e,
  children: t,
  ...n
}) {
  return /* @__PURE__ */ b(
    z.Item,
    {
      "data-slot": "select-item",
      className: x(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        e
      ),
      ...n,
      children: [
        /* @__PURE__ */ a(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ a(z.ItemIndicator, { children: /* @__PURE__ */ a(Za, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ a(z.ItemText, { children: t })
      ]
    }
  );
}
function Sd({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    z.Separator,
    {
      "data-slot": "select-separator",
      className: x("pointer-events-none -mx-1 my-1 h-px bg-border", e),
      ...t
    }
  );
}
function gi({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    z.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: x("flex cursor-default items-center justify-center py-1", e),
      ...t,
      children: /* @__PURE__ */ a(Ha, { className: "size-4" })
    }
  );
}
function vi({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    z.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: x("flex cursor-default items-center justify-center py-1", e),
      ...t,
      children: /* @__PURE__ */ a(Yn, { className: "size-4" })
    }
  );
}
const bi = "relative box-border h-1.5 w-full overflow-hidden rounded-[var(--radius-full)] border border-solid border-[rgba(44,140,201,1)] bg-[rgba(235,253,255,1)]";
function yi(e, t) {
  return e == null ? "…" : `${Math.min(100, Math.max(0, Math.round(e / t * 100)))}% complete`;
}
const Ci = u.forwardRef(
  ({
    className: e,
    label: t,
    labelClassName: n,
    labelVariant: r = "none",
    scaleStartLabel: o = "0",
    scaleEndLabel: i = "100",
    progressValueLabel: s,
    completeLabelOverride: l,
    value: c,
    max: f = 100,
    ...d
  }, p) => {
    const m = typeof c == "number" && !Number.isNaN(c) ? c : null, g = typeof f == "number" && f > 0 ? f : 100, v = m != null ? Math.min(100, Math.max(0, m / g * 100)) : 0, h = s ?? (m != null ? String(Math.min(100, Math.max(0, Math.round(m / g * 100)))) : "…"), y = l ?? yi(m, g), C = r === "scale" || r === "complete-left" || t != null, L = /* @__PURE__ */ a(
      wt.Root,
      {
        ref: p,
        "data-slot": "progress",
        className: x(bi, C ? void 0 : e),
        value: m,
        max: g,
        ...d,
        children: /* @__PURE__ */ a(
          wt.Indicator,
          {
            "data-slot": "progress-indicator",
            className: x(
              "h-full w-full flex-1 rounded-[var(--radius-full)] bg-[rgba(44,140,201,1)]",
              "origin-left transition-transform duration-500 ease-out",
              "data-[state=indeterminate]:w-[36%] data-[state=indeterminate]:max-w-none data-[state=indeterminate]:flex-none"
            ),
            style: m != null ? { transform: `translateX(-${100 - v}%)` } : void 0
          }
        )
      }
    );
    if (!C)
      return L;
    if (r === "scale") {
      const _ = Math.min(100, Math.max(0, v)), w = m === null;
      return /* @__PURE__ */ b(
        "div",
        {
          "data-slot": "progress-field",
          className: x("inline-flex w-full max-w-full flex-col gap-1", e),
          children: [
            L,
            /* @__PURE__ */ b(
              "div",
              {
                "data-slot": "progress-scale-row",
                className: x("relative mt-1 min-h-[1.125rem]", n),
                children: [
                  /* @__PURE__ */ b("div", { className: "flex justify-between text-xs text-muted-foreground tabular-nums", children: [
                    /* @__PURE__ */ a("span", { "data-slot": "progress-scale-start", children: o }),
                    /* @__PURE__ */ a("span", { "data-slot": "progress-scale-end", children: i })
                  ] }),
                  /* @__PURE__ */ a("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 top-0 flex items-end", children: /* @__PURE__ */ a(
                    "div",
                    {
                      "data-slot": "progress-current-cluster",
                      className: "absolute bottom-0 z-10 flex items-baseline gap-1.5 whitespace-nowrap text-xs text-muted-foreground",
                      style: w ? {
                        left: "50%",
                        transform: "translateX(-50%)"
                      } : {
                        left: `${_}%`,
                        transform: "translateX(-100%)"
                      },
                      children: /* @__PURE__ */ a("span", { className: "tabular-nums", "data-slot": "progress-current-value", children: h })
                    }
                  ) })
                ]
              }
            )
          ]
        }
      );
    }
    return r === "complete-left" ? /* @__PURE__ */ b(
      "div",
      {
        "data-slot": "progress-field",
        className: x("inline-flex w-full max-w-full flex-col gap-1", e),
        children: [
          L,
          /* @__PURE__ */ a(
            "span",
            {
              "data-slot": "progress-complete-label",
              className: x("block text-left text-xs text-muted-foreground", n),
              children: y
            }
          )
        ]
      }
    ) : /* @__PURE__ */ b(
      "div",
      {
        "data-slot": "progress-field",
        className: x("inline-flex w-full max-w-full flex-col gap-1", e),
        children: [
          L,
          /* @__PURE__ */ a(
            "span",
            {
              "data-slot": "progress-label",
              className: x("text-xs text-muted-foreground", n),
              children: t
            }
          )
        ]
      }
    );
  }
);
Ci.displayName = wt.Root.displayName;
const Yt = u.createContext(null);
function et() {
  const e = u.useContext(Yt);
  if (!e) throw new Error("Stepper components must be used within <Stepper>");
  return e;
}
const _r = u.createContext(null), Xt = u.createContext(null);
function wr() {
  const e = u.useContext(Xt);
  if (e == null) throw new Error("StepperItem subcomponents must be inside <StepperItem>");
  return e;
}
const xr = u.forwardRef(
  ({ className: e, value: t, onValueChange: n, size: r = "default", children: o, ...i }, s) => /* @__PURE__ */ a(Yt.Provider, { value: { value: t, onValueChange: n, size: r }, children: /* @__PURE__ */ a(
    "nav",
    {
      ref: s,
      "aria-label": "Steps",
      "data-slot": "stepper",
      "data-size": r,
      className: x("w-full", e),
      ...i,
      children: o
    }
  ) })
);
xr.displayName = "Stepper";
const qt = u.forwardRef(
  ({ className: e, segmentIndex: t, style: n, children: r, ...o }, i) => {
    const { value: s, size: l } = et(), c = u.useContext(_r), f = typeof c == "number" ? c : t ?? 0, d = l === "sm", p = Number(s), m = Number.isFinite(p) && p > Number(f);
    return /* @__PURE__ */ b(
      "li",
      {
        ref: i,
        ...o,
        "data-slot": "stepper-separator",
        "data-state": m ? "filled" : "upcoming",
        "aria-hidden": !0,
        className: x(
          "flex min-h-px min-w-[1rem] flex-1 list-none items-center self-start p-0",
          d ? "mx-0.5 mt-3" : "mx-1 mt-4",
          e
        ),
        style: n,
        children: [
          /* @__PURE__ */ a(
            "span",
            {
              "data-ef-stepper-connector-bar": !0,
              "data-filled": m ? "true" : "false",
              className: "box-border block h-[2px] w-full min-w-[1rem] shrink-0 rounded-full"
            }
          ),
          r
        ]
      }
    );
  }
);
qt.displayName = "StepperSeparator";
function _i(e) {
  if (!u.isValidElement(e)) return !1;
  const t = e.type;
  return t === qt || t?.displayName === "StepperSeparator";
}
function wi(e) {
  return u.isValidElement(e) && e.type.displayName === "StepperItem";
}
const Nr = u.forwardRef(
  ({ className: e, children: t, ...n }, r) => {
    const o = [];
    let i = 0, s = 0;
    return u.Children.forEach(t, (l) => {
      if (_i(l)) {
        const c = s++;
        o.push(
          /* @__PURE__ */ a(_r.Provider, { value: c, children: u.cloneElement(l, {
            key: l.key ?? `stepper-sep-inner-${c}`,
            segmentIndex: c
          }) }, l.key ?? `stepper-sep-${c}`)
        );
        return;
      }
      if (wi(l)) {
        const c = i++;
        o.push(
          u.cloneElement(l, {
            key: l.key ?? `stepper-item-${c}`,
            step: c
          })
        );
        return;
      }
      o.push(l);
    }), /* @__PURE__ */ a(
      "ol",
      {
        ref: r,
        "data-slot": "stepper-list",
        className: x("m-0 flex w-full list-none items-start gap-0 p-0", e),
        ...n,
        children: o
      }
    );
  }
);
Nr.displayName = "StepperList";
const Lr = u.forwardRef(
  ({ className: e, step: t, children: n, ...r }, o) => {
    const i = t ?? 0, { value: s, size: l } = et(), c = i < s ? "complete" : i === s ? "active" : "upcoming", f = l === "sm";
    return /* @__PURE__ */ a(Xt.Provider, { value: i, children: /* @__PURE__ */ a(
      "li",
      {
        ref: o,
        "data-slot": "stepper-item",
        "data-state": c,
        className: x(
          "relative flex min-w-0 shrink-0 flex-col items-center",
          f ? "gap-1" : "gap-2",
          e
        ),
        ...r,
        children: n
      }
    ) });
  }
);
Lr.displayName = "StepperItem";
const xi = u.forwardRef(
  ({ className: e, type: t = "button", disabled: n, onClick: r, children: o, ...i }, s) => {
    const { value: l, onValueChange: c, size: f } = et(), d = wr(), p = c != null && !n && d <= l, g = x(
      "group/stepper-trigger flex rounded-md",
      f === "sm" ? "w-auto flex-row items-center gap-2 text-left" : "w-full max-w-[10rem] flex-col items-center gap-2 text-center"
    ), v = x(
      g,
      p && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:opacity-90",
      !c && "cursor-default",
      c && d > l && "cursor-default",
      e
    );
    return c ? /* @__PURE__ */ a(
      "button",
      {
        ref: s,
        type: t,
        "data-slot": "stepper-trigger",
        "aria-current": d === l ? "step" : void 0,
        disabled: n ?? d > l,
        className: x(
          v,
          "disabled:pointer-events-none disabled:opacity-100"
        ),
        onClick: (h) => {
          r?.(h), !h.defaultPrevented && p && c(d);
        },
        ...i,
        children: o
      }
    ) : /* @__PURE__ */ a(
      "div",
      {
        "data-slot": "stepper-trigger",
        "aria-current": d === l ? "step" : void 0,
        className: v,
        children: o
      }
    );
  }
);
xi.displayName = "StepperTrigger";
const wn = "bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)]";
function xn(e, t = "default") {
  const n = t === "sm";
  return x(
    "flex shrink-0 items-center justify-center rounded-[var(--radius-full)] font-semibold tabular-nums transition-colors",
    n ? "size-6 text-[10px]" : "size-8 text-xs",
    e === "complete" && x(wn, n ? "[&_.material-symbols-outlined]:text-[14px] [&_.material-symbols-outlined]:leading-none" : "[&_.material-symbols-outlined]:text-[18px] [&_.material-symbols-outlined]:leading-none"),
    e === "active" && x(
      wn,
      n ? "ring-[1.5px] ring-[var(--color-button-primary-bg)] ring-offset-[1.5px] ring-offset-background" : "ring-2 ring-[var(--color-button-primary-bg)] ring-offset-2 ring-offset-background"
    ),
    e === "upcoming" && "bg-[rgba(235,253,255,0.6)] text-[var(--muted-foreground)]"
  );
}
function Nn({ sm: e }) {
  return /* @__PURE__ */ a(
    "span",
    {
      className: "material-symbols-outlined font-normal",
      style: { fontSize: e ? "14px" : "18px", fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" },
      "aria-hidden": !0,
      children: "check"
    }
  );
}
const Er = u.forwardRef(
  ({ className: e, stepDisplay: t, forceState: n, children: r, ...o }, i) => {
    const s = u.useContext(Xt), l = u.useContext(Yt), c = l?.size ?? "default", f = c === "sm";
    if (n != null) {
      const h = t ?? 1, y = n === "complete";
      return /* @__PURE__ */ a(
        "div",
        {
          ref: i,
          "data-slot": "stepper-indicator",
          "data-state": n,
          className: x(xn(n, c), e),
          ...o,
          children: r ?? (y ? /* @__PURE__ */ a(Nn, { sm: f }) : h)
        }
      );
    }
    if (s == null || l == null)
      throw new Error(
        "StepperIndicator must be inside StepperItem, or pass forceState for a static preview."
      );
    const d = s, p = l.value, m = d < p ? "complete" : d === p ? "active" : "upcoming", g = t ?? d + 1, v = m === "complete";
    return /* @__PURE__ */ a(
      "div",
      {
        ref: i,
        "data-slot": "stepper-indicator",
        "data-state": m,
        className: x(xn(m, c), e),
        ...o,
        children: r ?? (v ? /* @__PURE__ */ a(Nn, { sm: f }) : g)
      }
    );
  }
);
Er.displayName = "StepperIndicator";
const kr = u.forwardRef(
  ({ className: e, ...t }, n) => {
    const r = wr(), { value: o, size: i } = et(), s = r === o, l = r < o;
    return /* @__PURE__ */ a(
      "span",
      {
        ref: n,
        "data-slot": "stepper-title",
        className: x(
          "text-center font-medium leading-tight break-words",
          i === "sm" ? "max-w-[7rem] text-[11px]" : "max-w-[10rem] text-xs",
          (s || l) && "text-foreground",
          !s && !l && "text-muted-foreground",
          e
        ),
        ...t
      }
    );
  }
);
kr.displayName = "StepperTitle";
const Ni = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a(
    "span",
    {
      ref: n,
      "data-slot": "stepper-description",
      className: x(
        "max-w-[10rem] text-center text-[11px] leading-snug text-muted-foreground break-words",
        e
      ),
      ...t
    }
  )
);
Ni.displayName = "StepperDescription";
function Md({ ...e }) {
  return /* @__PURE__ */ a(Z.Root, { "data-slot": "dialog", ...e });
}
function Rd({ ...e }) {
  return /* @__PURE__ */ a(Z.Trigger, { "data-slot": "dialog-trigger", ...e });
}
function Li({ ...e }) {
  return /* @__PURE__ */ a(Z.Portal, { "data-slot": "dialog-portal", ...e });
}
function Ad({ ...e }) {
  return /* @__PURE__ */ a(Z.Close, { "data-slot": "dialog-close", ...e });
}
function Ei({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    Z.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: x("ef-dialog__overlay", e),
      ...t
    }
  );
}
function Fd({
  className: e,
  children: t,
  showCloseButton: n = !0,
  steps: r,
  currentStep: o = 0,
  ...i
}) {
  return /* @__PURE__ */ b(Li, { children: [
    /* @__PURE__ */ a(Ei, {}),
    /* @__PURE__ */ b(
      Z.Content,
      {
        "data-slot": "dialog-content",
        className: x("ef-dialog__content", e),
        ...i,
        children: [
          t,
          n && /* @__PURE__ */ b(Z.Close, { "data-slot": "dialog-close", className: "ef-dialog__close-btn", children: [
            /* @__PURE__ */ a("span", { className: "material-symbols-outlined", style: { fontSize: 20 }, "aria-hidden": !0, children: "close" }),
            /* @__PURE__ */ a("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function Pd({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "dialog-header",
      className: x("ef-dialog__header", e),
      ...t
    }
  );
}
function Td({ steps: e, currentStep: t = 0, className: n }) {
  return /* @__PURE__ */ a(xr, { value: t, size: "sm", className: x("ef-dialog__stepper", n), children: /* @__PURE__ */ a(Nr, { children: e.map((r, o) => /* @__PURE__ */ b(u.Fragment, { children: [
    o > 0 && /* @__PURE__ */ a(qt, {}),
    /* @__PURE__ */ b(Lr, { children: [
      /* @__PURE__ */ a(Er, {}),
      /* @__PURE__ */ a(kr, { children: r.label })
    ] })
  ] }, o)) }) });
}
function Od({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "dialog-body",
      className: x("ef-dialog__body", e),
      ...t
    }
  );
}
function Dd({ className: e, ...t }) {
  return /* @__PURE__ */ a(
    "div",
    {
      "data-slot": "dialog-footer",
      className: x("ef-dialog__footer", e),
      ...t
    }
  );
}
function Id({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    Z.Title,
    {
      "data-slot": "dialog-title",
      className: x("ef-dialog__title", e),
      ...t
    }
  );
}
function Vd({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ a(
    Z.Description,
    {
      "data-slot": "dialog-description",
      className: x("ef-dialog__description", e),
      ...t
    }
  );
}
const ki = u.forwardRef(
  ({ className: e, value: t, color: n = "grey", size: r = "md", ...o }, i) => /* @__PURE__ */ a(
    "span",
    {
      ref: i,
      "data-slot": "number-badge",
      className: x(
        "number-badge",
        `number-badge--${r}`,
        `number-badge--${n}`,
        e
      ),
      ...o,
      children: t
    }
  )
);
ki.displayName = "NumberBadge";
function Si(e) {
  return e === !0 || e === "alert" ? "stat-card__badge--alert" : e === "success" ? "stat-card__badge--success" : e === "info" ? "stat-card__badge--info" : "";
}
const Mi = u.forwardRef(
  ({ className: e, icon: t = "person", label: n, value: r, pct: o, color: i = "grey", size: s = "lg", variant: l = "outlined", iconBadge: c, ...f }, d) => /* @__PURE__ */ b(
    "div",
    {
      ref: d,
      "data-slot": "stat-card",
      className: x(
        "stat-card",
        `stat-card--${s}`,
        `stat-card--${i}`,
        `stat-card--${l}`,
        e
      ),
      ...f,
      children: [
        /* @__PURE__ */ b("div", { className: "stat-card__icon", children: [
          /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: t }),
          c && /* @__PURE__ */ a("span", { className: x("stat-card__badge", Si(c)), "aria-hidden": !0 })
        ] }),
        /* @__PURE__ */ b("div", { className: "stat-card__text", children: [
          /* @__PURE__ */ a("span", { className: "stat-card__label", children: n }),
          /* @__PURE__ */ b("div", { className: "stat-card__value-row", children: [
            /* @__PURE__ */ a("span", { className: "stat-card__value", children: r }),
            o && /* @__PURE__ */ b("span", { className: "stat-card__pct", children: [
              "(",
              o,
              ")"
            ] })
          ] })
        ] })
      ]
    }
  )
);
Mi.displayName = "StatCard";
const Ri = u.forwardRef(
  ({ className: e, size: t = "lg", children: n, ...r }, o) => /* @__PURE__ */ a(
    "div",
    {
      ref: o,
      "data-slot": "stat-card-group",
      className: x(
        "stat-card-group",
        `stat-card-group--${t}`,
        e
      ),
      ...r,
      children: u.Children.map(n, (i, s) => /* @__PURE__ */ b(V, { children: [
        s > 0 && /* @__PURE__ */ a("div", { className: "stat-card-group__divider", "aria-hidden": !0 }),
        i
      ] }))
    }
  )
);
Ri.displayName = "StatCardGroup";
function Ai({
  to: e,
  children: t,
  className: n,
  onClick: r
}) {
  return /* @__PURE__ */ a("a", { href: e, className: n, onClick: r, children: t });
}
function Fi({
  tabs: e,
  avatarMenuItems: t,
  user: n,
  switchOptions: r = [],
  onSwitchUser: o,
  activePath: i = "",
  homePath: s = "/",
  logoSrc: l = "/eightfold-logo.svg",
  productName: c = "Career Hub",
  productIconSrc: f = "/career-hub-icon.svg",
  hideProductIcon: d = !1,
  searchPlaceholder: p = "Type to search",
  onSearchChange: m,
  onSearchIconClick: g,
  actionButtons: v = [],
  LinkComponent: h = Ai,
  NavLinkComponent: y
}) {
  const [C, L] = _t(!1), [_, w] = _t(!1), E = h, k = i === "/profile", S = n.avatarType === "photo" && n.avatarPhotoSrc ? n.avatarPhotoSrc.replace("w=200&h=200", "w=80&h=80") : null, F = (N) => {
    const P = N.chevron && N.subItems && N.subItems.length > 0;
    if (N.path && P) {
      const O = i === N.path || N.subItems.some((T) => T.path === i);
      return /* @__PURE__ */ a("li", { className: "nav-menu__item", children: /* @__PURE__ */ b(W.Root, { children: [
        /* @__PURE__ */ a(W.Trigger, { asChild: !0, children: /* @__PURE__ */ b("button", { className: `navbar__tab navbar__tab--dropdown ${O ? "navbar__tab--active" : ""}`, type: "button", children: [
          /* @__PURE__ */ a("span", { className: "navbar__tab-label", children: N.label }),
          /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", style: { fontSize: 16, marginLeft: 2 }, children: "expand_more" })
        ] }) }),
        /* @__PURE__ */ a(W.Portal, { children: /* @__PURE__ */ a(W.Content, { className: "navbar__tab-menu-inner", align: "start", sideOffset: 4, style: { zIndex: 99999 }, children: N.subItems.map((T) => /* @__PURE__ */ a(W.Item, { asChild: !0, children: /* @__PURE__ */ a(E, { to: T.path, className: "nav-menu__link navbar__tab-menu-item", children: T.label }) }, T.path)) }) })
      ] }) }, N.id);
    }
    if (N.path) {
      const O = y && y !== h, T = i === N.path || N.path === "/" && !i;
      return O ? /* @__PURE__ */ a(lt, { children: /* @__PURE__ */ a(dt, { asChild: !0, active: T, children: /* @__PURE__ */ a(y, { to: N.path, className: "navbar__tab navbar__tab--link", children: /* @__PURE__ */ b("span", { className: "navbar__tab-label", children: [
        N.label,
        N.chevron && /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", "aria-hidden": !0, children: "expand_more" })
      ] }) }) }) }, N.id) : /* @__PURE__ */ a(lt, { children: /* @__PURE__ */ a(dt, { asChild: !0, active: T, children: /* @__PURE__ */ a(E, { to: N.path, className: "navbar__tab navbar__tab--link", children: /* @__PURE__ */ b("span", { className: "navbar__tab-label", children: [
        N.label,
        N.chevron && /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", "aria-hidden": !0, children: "expand_more" })
      ] }) }) }) }, N.id);
    }
    return /* @__PURE__ */ a(lt, { children: /* @__PURE__ */ a(dt, { href: "#", className: "navbar__tab", children: /* @__PURE__ */ b("span", { className: "navbar__tab-label", children: [
      N.label,
      N.chevron && /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", "aria-hidden": !0, children: "expand_more" })
    ] }) }) }, N.id);
  }, R = (N) => N.path ? N.chevron && N.subItems && N.subItems.length > 0 ? /* @__PURE__ */ b("div", { className: "navbar__menu-group", children: [
    /* @__PURE__ */ a(E, { to: N.path, className: "navbar__menu-link navbar__menu-link--parent", onClick: () => L(!1), children: N.label }),
    /* @__PURE__ */ a("div", { className: "navbar__menu-sublinks", children: N.subItems.map((O) => /* @__PURE__ */ a(
      E,
      {
        to: O.path,
        className: "navbar__menu-link navbar__menu-link--sub",
        onClick: () => L(!1),
        children: O.label
      },
      O.path
    )) })
  ] }, N.id) : /* @__PURE__ */ b(
    E,
    {
      to: N.path,
      className: "navbar__menu-link",
      onClick: () => L(!1),
      children: [
        N.label,
        N.chevron && /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", "aria-hidden": !0, children: "expand_more" })
      ]
    },
    N.id
  ) : /* @__PURE__ */ b(
    "a",
    {
      href: "#",
      className: "navbar__menu-link",
      onClick: (P) => {
        P.preventDefault(), N.onClick?.(), L(!1);
      },
      children: [
        N.label,
        N.chevron && /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__tab-chevron", "aria-hidden": !0, children: "expand_more" })
      ]
    },
    N.id
  );
  return /* @__PURE__ */ b("nav", { className: "navbar", children: [
    /* @__PURE__ */ b("div", { className: "navbar__inner", children: [
      /* @__PURE__ */ b("div", { className: "navbar__left", children: [
        /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "navbar__menu-btn",
            onClick: () => L(!0),
            "aria-label": "Open menu",
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__menu-btn-icon", children: "menu" })
          }
        ),
        /* @__PURE__ */ b(E, { to: s, className: "navbar__branding", children: [
          /* @__PURE__ */ a("img", { src: l, alt: "", className: "navbar__logo" }),
          /* @__PURE__ */ a("div", { className: "navbar__divider" }),
          /* @__PURE__ */ b("div", { className: "navbar__product", children: [
            !d && /* @__PURE__ */ a("img", { src: f, alt: "", className: "navbar__product-icon", width: 40, height: 40 }),
            /* @__PURE__ */ a(
              "span",
              {
                className: `navbar__product-name ${c.trim().split(/\s+/).length > 1 ? "navbar__product-name--two-lines" : ""}`,
                children: (() => {
                  const N = c.trim().split(/\s+/);
                  return N.length <= 1 ? c : /* @__PURE__ */ b(V, { children: [
                    /* @__PURE__ */ a("span", { className: "navbar__product-name__line", children: N[0] }),
                    /* @__PURE__ */ a("span", { className: "navbar__product-name__line", children: N.slice(1).join(" ") })
                  ] });
                })()
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ a(ci, { viewport: !1, variant: "underline", className: "navbar__tabs", delayDuration: 400, skipDelayDuration: 200, children: /* @__PURE__ */ a(di, { className: "navbar__tabs-list", children: e.map(F) }) })
      ] }),
      /* @__PURE__ */ b("div", { className: "navbar__right", children: [
        /* @__PURE__ */ b("div", { className: "navbar__search-wrap", children: [
          /* @__PURE__ */ b("div", { className: "navbar__search", children: [
            /* @__PURE__ */ a("span", { className: "navbar__search-input", children: /* @__PURE__ */ a(
              qa,
              {
                size: "small",
                shape: "pill",
                leadingIcon: "search",
                placeholder: p,
                "aria-label": "Search",
                onChange: (N) => m?.(N.target.value)
              }
            ) }),
            /* @__PURE__ */ a(
              "button",
              {
                type: "button",
                className: "navbar__search-icon-btn navbar__btn",
                "aria-label": "Search",
                onClick: () => g?.(),
                children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__btn-icon", children: "search" })
              }
            )
          ] }),
          /* @__PURE__ */ a("div", { className: "navbar__divider navbar__divider--vertical" })
        ] }),
        /* @__PURE__ */ b("div", { className: "navbar__right-icons", children: [
          v.map((N, P) => /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "navbar__btn navbar__btn--action",
              "aria-label": N.ariaLabel,
              onClick: N.onClick,
              children: N.iconSrc ? /* @__PURE__ */ a("img", { src: N.iconSrc, alt: "", className: "navbar__btn-icon-img", width: 20, height: 20 }) : /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__btn-icon", children: N.icon ?? "circle" })
            },
            P
          )),
          /* @__PURE__ */ a("button", { type: "button", className: "navbar__btn navbar__btn--menu", "aria-label": "App switcher", children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__btn-icon", children: "apps" }) })
        ] }),
        /* @__PURE__ */ b(W.Root, { children: [
          /* @__PURE__ */ a(W.Trigger, { asChild: !0, children: /* @__PURE__ */ b("button", { type: "button", className: "navbar__avatar", "aria-label": "Open profile menu", children: [
            /* @__PURE__ */ a(
              "span",
              {
                className: `navbar__avatar-inner ${n.avatarColor ? "navbar__avatar-inner--colored" : ""}`,
                style: n.avatarColor ? { backgroundColor: n.avatarColor } : void 0,
                children: _ || !S ? /* @__PURE__ */ a("span", { className: "navbar__avatar-initials", children: n.avatarInitials ?? "?" }) : /* @__PURE__ */ a(
                  "img",
                  {
                    src: S,
                    alt: "",
                    className: "navbar__avatar-img",
                    onError: () => w(!0)
                  }
                )
              }
            ),
            /* @__PURE__ */ a("span", { className: "material-symbols-outlined navbar__avatar-caret", "aria-hidden": !0, children: "expand_more" })
          ] }) }),
          /* @__PURE__ */ a(W.Portal, { children: /* @__PURE__ */ a(W.Content, { className: "navbar__avatar-menu", align: "end", sideOffset: 8, children: /* @__PURE__ */ b("div", { className: "navbar__avatar-menu-inner", children: [
            t.map((N) => /* @__PURE__ */ a(W.Item, { asChild: !0, children: /* @__PURE__ */ a(
              E,
              {
                to: N.path,
                className: `navbar__avatar-menu-item ${N.label === "My Profile" && k ? "navbar__avatar-menu-item--active" : ""}`,
                children: N.label
              }
            ) }, N.label)),
            r.length > 0 && o && /* @__PURE__ */ b(V, { children: [
              /* @__PURE__ */ a("div", { className: "navbar__avatar-menu-divider" }),
              /* @__PURE__ */ b("div", { className: "navbar__avatar-menu-switch", children: [
                /* @__PURE__ */ a(
                  "input",
                  {
                    type: "text",
                    placeholder: "Switch To...",
                    className: "navbar__avatar-menu-input",
                    "aria-label": "Switch to"
                  }
                ),
                r.map((N) => /* @__PURE__ */ a(W.Item, { asChild: !0, children: /* @__PURE__ */ a(
                  "button",
                  {
                    type: "button",
                    className: "navbar__avatar-menu-option",
                    onClick: () => o(N.userId),
                    children: N.label
                  }
                ) }, N.userId))
              ] })
            ] })
          ] }) }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ a(Z.Root, { open: C, onOpenChange: L, children: /* @__PURE__ */ b(Z.Portal, { children: [
      /* @__PURE__ */ a(Z.Overlay, { className: "navbar__menu-overlay" }),
      /* @__PURE__ */ b(Z.Content, { className: "navbar__menu-drawer", "aria-describedby": void 0, children: [
        /* @__PURE__ */ b("div", { className: "navbar__menu-header", children: [
          /* @__PURE__ */ a(
            "span",
            {
              className: `navbar__product-name ${c.trim().split(/\s+/).length > 1 ? "navbar__product-name--two-lines" : ""}`,
              children: (() => {
                const N = c.trim().split(/\s+/);
                return N.length <= 1 ? c : /* @__PURE__ */ b(V, { children: [
                  /* @__PURE__ */ a("span", { className: "navbar__product-name__line", children: N[0] }),
                  /* @__PURE__ */ a("span", { className: "navbar__product-name__line", children: N.slice(1).join(" ") })
                ] });
              })()
            }
          ),
          /* @__PURE__ */ a(Z.Close, { asChild: !0, children: /* @__PURE__ */ a("button", { type: "button", className: "navbar__menu-close", "aria-label": "Close menu", children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", children: "close" }) }) })
        ] }),
        /* @__PURE__ */ a("nav", { className: "navbar__menu-nav", children: e.map(R) })
      ] })
    ] }) })
  ] });
}
const Sr = u.createContext({
  variant: "career-hub",
  careerHubSize: "parent"
});
function Pi() {
  return u.useContext(Sr);
}
const Ti = qe(
  "w-full shrink-0 border-b border-[transparent] transition-colors",
  {
    variants: {
      variant: {
        "talent-acquisition": "border-b-[var(--color-blue-70)] bg-[var(--background)] [border-bottom-width:2px]",
        "career-hub": "border-b-[var(--border)] bg-[var(--color-background1-grey)]/60"
      }
    },
    defaultVariants: {
      variant: "career-hub"
    }
  }
), Mr = u.forwardRef(
  ({ className: e, variant: t, chSize: n = "parent", sticky: r = !1, overlayBackground: o = !1, ...i }, s) => {
    const l = t ?? "career-hub", c = {
      variant: l,
      careerHubSize: l === "career-hub" ? n : "parent"
    };
    return /* @__PURE__ */ a(Sr.Provider, { value: c, children: /* @__PURE__ */ a(
      "header",
      {
        ref: s,
        "data-slot": "header",
        "data-variant": l,
        "data-ch-size": l === "career-hub" ? n : void 0,
        className: x(
          Ti({ variant: l }),
          o && l === "career-hub" && "!bg-transparent",
          r && "sticky top-0 z-30",
          r && !(o && l === "career-hub") && "backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--background)]/95",
          l === "career-hub" && r && !(o && l === "career-hub") && "supports-[backdrop-filter]:bg-[var(--color-background1-grey)]/80",
          r && o && l === "career-hub" && "supports-[backdrop-filter]:bg-transparent",
          e
        ),
        ...i
      }
    ) });
  }
);
Mr.displayName = "Header";
const Oi = {
  profile: "h-[var(--header-career-hub-profile-height)] min-h-[var(--header-career-hub-profile-height)] flex-wrap items-start content-start gap-y-3 pb-4 pl-[var(--spacing-12)] pr-[var(--spacing-12)] md:pb-6 md:gap-5",
  parent: "h-[var(--header-career-hub-parent-height)] min-h-[var(--header-career-hub-parent-height)] items-start gap-4 pl-[var(--spacing-12)] pr-[var(--spacing-12)]",
  child: "h-[var(--header-career-hub-child-height)] min-h-[var(--header-career-hub-child-height)] items-start gap-3 pb-2 pl-[var(--spacing-12)] pr-[var(--spacing-12)]"
}, Rr = u.forwardRef(
  ({ className: e, actions: t, children: n, ...r }, o) => {
    const { variant: i, careerHubSize: s } = Pi(), l = "flex min-h-12 w-full max-w-[100vw] items-start gap-3 py-0 pl-[var(--spacing-12)] pr-[var(--spacing-12)] md:h-[var(--navbar-height,3.75rem)] md:gap-4", c = x(
      "flex w-full max-w-[100vw] items-start",
      Oi[s]
    );
    return /* @__PURE__ */ b(
      "div",
      {
        ref: o,
        "data-slot": "header-toolbar",
        className: x(i === "talent-acquisition" ? l : c, e),
        ...r,
        children: [
          n,
          t != null ? /* @__PURE__ */ a("div", { "data-slot": "header-actions", children: t }) : null
        ]
      }
    );
  }
);
Rr.displayName = "HeaderToolbar";
const Di = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a("div", { ref: n, "data-slot": "header-actions", className: x(e), ...t })
);
Di.displayName = "HeaderActions";
const Ii = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a(
    "div",
    {
      ref: n,
      "data-slot": "header-group",
      className: x("flex min-w-0 items-center gap-2 md:gap-3", e),
      ...t
    }
  )
);
Ii.displayName = "HeaderGroup";
const Ar = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a("h1", { ref: n, "data-slot": "header-title", className: x(e), ...t })
);
Ar.displayName = "HeaderTitle";
const Fr = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a("div", { ref: n, "data-slot": "header-text-group", className: x(e), ...t })
);
Fr.displayName = "HeaderTextGroup";
const Pr = u.forwardRef(
  ({ className: e, ...t }, n) => /* @__PURE__ */ a("p", { ref: n, "data-slot": "header-secondary", className: x(e), ...t })
);
Pr.displayName = "HeaderSecondary";
const Vi = '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="540" viewBox="0 0 1440 540" fill="none"><g clip-path="url(#ef_ch_prof)"><rect width="1440" height="540" fill="white"/><path d="M760 77.8125L860 20V120L760 177.812V77.8125Z" fill="#C15151"/><path d="M960 77.8125L860 20V120L960 177.812V77.8125Z" fill="#F29D31"/><path d="M1060 251.25L1160 193.438V293.438L1060 351.25V251.25Z" fill="#69717F"/><path d="M1260 251.25L1160 193.438V293.438L1260 351.25V251.25Z" fill="#2DB3C7"/><path d="M1160 -6.5625L1060 -64.375V35.625L1160 93.4375V-6.5625Z" fill="#F29D31"/><path d="M1360 93.4375L1260 35.625V135.625L1360 193.438V93.4375Z" fill="#F29D31"/><path d="M960 -22.1875L860 -80V20L960 77.8125V-22.1875Z" fill="#2DB3C7"/><path d="M1460 351.25L1360 293.438V393.438L1460 451.25V351.25Z" fill="#858B98"/><path d="M1460 451.25L1360 393.438V493.438L1460 551.25V451.25Z" fill="#2DB3C7"/><path d="M1460 251.25L1360 193.438V293.438L1460 351.25V251.25Z" fill="#E46F6F"/><path d="M1160 -6.5625L1260 -64.375V35.625L1160 93.4375V-6.5625Z" fill="#1999AC"/><path d="M1160 93.4375L1260 35.625V135.625L1160 193.438V93.4375Z" fill="#69717F"/><path d="M1360 -6.5625L1460 -64.375V35.625L1360 93.4375V-6.5625Z" fill="#1999AC"/><path d="M1360 93.4375L1460 35.625V135.625L1360 193.438V93.4375Z" fill="#69717F"/><path d="M1060 35.625L960 -22.1875V77.8125L1060 135.625V35.625Z" fill="#E46F6F"/></g><defs><clipPath id="ef_ch_prof"><rect width="1440" height="540" fill="white"/></clipPath></defs></svg>', Bi = '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="292" viewBox="0 0 1440 292" fill="none"><g clip-path="url(#ef_ch_def)"><rect width="1440" height="292" fill="white"/><path d="M760 80.8585L860 20.7829V124.697L760 184.773V80.8585Z" fill="#C15151"/><path d="M960 80.8585L860 20.7829V124.697L960 184.773V80.8585Z" fill="#F29D31"/><path d="M1060 261.085L1160 201.01V304.924L1060 365V261.085Z" fill="#69717F"/><path d="M1260 261.085L1160 201.01V304.924L1260 365V261.085Z" fill="#2DB3C7"/><path d="M1160 -6.8194L1060 -66.895V37.0196L1160 97.0952V-6.8194Z" fill="#F29D31"/><path d="M1360 97.0952L1260 37.0196V140.934L1360 201.01V97.0952Z" fill="#F29D31"/><path d="M960 -23.056L860 -83.1317V20.7829L960 80.8586V-23.056Z" fill="#2DB3C7"/><path d="M1460 261.085L1360 201.01V304.924L1460 365V261.085Z" fill="#E46F6F"/><path d="M1160 -6.8194L1260 -66.895V37.0196L1160 97.0952V-6.8194Z" fill="#1999AC"/><path d="M1160 97.0952L1260 37.0196V140.934L1160 201.01V97.0952Z" fill="#69717F"/><path d="M1360 -6.8194L1460 -66.895V37.0196L1360 97.0952V-6.8194Z" fill="#1999AC"/><path d="M1360 97.0952L1460 37.0196V140.934L1360 201.01V97.0952Z" fill="#69717F"/><path d="M1060 37.0196L960 -23.0561V80.8585L1060 140.934V37.0196Z" fill="#E46F6F"/></g><defs><clipPath id="ef_ch_def"><rect width="1440" height="292" fill="white"/></clipPath></defs></svg>';
function $i(e) {
  return `url("data:image/svg+xml,${encodeURIComponent(e === "profile" ? Vi : Bi)}")`;
}
const Zi = '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="540" viewBox="0 0 1440 540" fill="none"><g clip-path="url(#ef_hex_prof)"><rect width="1440" height="540" fill="#ffffff"/><path d="M578.038 175.577V234.422L629 263.845L679.962 234.422V175.577L629 146.154L578.038 175.577Z" stroke="#A9B0F5" stroke-width="2"/><path d="M629 157L587.431 181V229L629 253L670.569 229V181L629 157Z" fill="#A9B0F5"/><path opacity="0.5" d="M629 173L601.287 189V221L629 237L656.713 221V189L629 173Z" fill="#5962B7"/><path d="M835 110L807.287 126V158L835 174L862.713 158V126L835 110Z" fill="#FFA3A3"/><path opacity="0.5" d="M835 121L816.813 131.5V152.5L835 163L853.187 152.5V131.5L835 121Z" fill="#C15151"/><path d="M990 153L913.79 197V285L990 329L1066.21 285V197L990 153Z" fill="#BEC2CA"/><path opacity="0.5" d="M989.5 181L938.838 210.75V270.25L989.5 300L1040.16 270.25V210.75L989.5 181Z" fill="#69717F"/><path d="M1124 139L981.106 221.5V386.5L1124 469L1266.89 386.5V221.5L1124 139Z" fill="#FFA3A3"/><path opacity="0.5" d="M1124 194L1028.74 249V359L1124 414L1219.26 359V249L1124 194Z" fill="#C15151"/><path d="M1285 291L1243.43 315V363L1285 387L1326.57 363V315L1285 291Z" fill="#A9B0F5"/><path opacity="0.5" d="M1285 307L1257.29 323V355L1285 371L1312.71 355V323L1285 307Z" fill="#5962B7"/><path d="M1108 -78L1031.79 -34V54L1108 98L1184.21 54V-34L1108 -78Z" fill="#BEC2CA"/><path opacity="0.5" d="M1107.5 -50L1056.84 -20.25V39.25L1107.5 69L1158.16 39.25V-20.25L1107.5 -50Z" fill="#69717F"/><path d="M1200.59 -181.179V20.1777L1371.5 120.839L1542.41 20.1777V-181.179L1371.5 -281.84L1200.59 -181.179Z" stroke="#BEC2CA" stroke-width="2"/><path d="M1371.5 -251L1222.11 -165V7L1371.5 93L1520.89 7V-165L1371.5 -251Z" fill="#BEC2CA"/><path opacity="0.5" d="M1371.5 -195L1271.47 -137V-21L1371.5 37L1471.53 -21V-137L1371.5 -195Z" fill="#69717F"/><path d="M1315.41 113.32V229.679L1414 287.839L1512.59 229.679V113.32L1414 55.1602L1315.41 113.32Z" stroke="#FFA3A3" stroke-width="2"/><path d="M1414 72L1327.4 122V222L1414 272L1500.6 222V122L1414 72Z" fill="#FFA3A3"/><path opacity="0.5" d="M1414 105L1355.98 138.5V205.5L1414 239L1472.02 205.5V138.5L1414 105Z" fill="#C15151"/><path d="M1363 56L1339.62 69.5V96.5L1363 110L1386.38 96.5V69.5L1363 56Z" fill="#FFCD78"/><path opacity="0.5" d="M1363 65L1347.41 74V92L1363 101L1378.59 92V74L1363 65Z" fill="#C97E19"/><path d="M1321 -50L1279.43 -26V22L1321 46L1362.57 22V-26L1321 -50Z" fill="#A9B0F5"/><path opacity="0.5" d="M1321 -34L1293.29 -18V14L1321 30L1348.71 14V-18L1321 -34Z" fill="#5962B7"/><path d="M756 256L686.718 296V376L756 416L825.282 376V296L756 256Z" fill="#FFCD78"/><path opacity="0.5" d="M756 283L710.101 309.5V362.5L756 389L801.899 362.5V309.5L756 283Z" fill="#C97E19"/><path d="M861.637 -14.9229V40.9219L910 68.8447L958.363 40.9219V-14.9229L910 -42.8457L861.637 -14.9229Z" stroke="#FFCD78" stroke-width="2"/><path d="M910 -29L873.627 -8V34L910 55L946.373 34V-8L910 -29Z" fill="#FFCD78"/><path opacity="0.5" d="M910 -14L886.617 -0.5V26.5L910 40L933.383 26.5V-0.5L910 -14Z" fill="#C97E19"/><path d="M788 155L764.617 168.5V195.5L788 209L811.383 195.5V168.5L788 155Z" fill="#FFCD78"/><path opacity="0.5" d="M788 164L772.412 173V191L788 200L803.588 191V173L788 164Z" fill="#C97E19"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 417.531)" stroke="#BEC2CA" stroke-width="2"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 441.758)" stroke="#BEC2CA" stroke-width="2"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 465.984)" stroke="#BEC2CA" stroke-width="2"/></g><defs><clipPath id="ef_hex_prof"><rect width="1440" height="540" fill="white"/></clipPath></defs></svg>', Hi = '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="292" viewBox="0 0 1440 292" fill="none"><g clip-path="url(#ef_hex_def)"><rect width="1440" height="292" fill="#ffffff"/><path d="M578.038 175.577V234.422L629 263.845L679.962 234.422V175.577L629 146.154L578.038 175.577Z" stroke="#A9B0F5" stroke-width="2"/><path d="M629 157L587.431 181V229L629 253L670.569 229V181L629 157Z" fill="#A9B0F5"/><path opacity="0.5" d="M629 173L601.287 189V221L629 237L656.713 221V189L629 173Z" fill="#5962B7"/><path d="M835 110L807.287 126V158L835 174L862.713 158V126L835 110Z" fill="#FFA3A3"/><path opacity="0.5" d="M835 121L816.813 131.5V152.5L835 163L853.187 152.5V131.5L835 121Z" fill="#C15151"/><path d="M990 153L913.79 197V285L990 329L1066.21 285V197L990 153Z" fill="#BEC2CA"/><path opacity="0.5" d="M989.5 181L938.838 210.75V270.25L989.5 300L1040.16 270.25V210.75L989.5 181Z" fill="#69717F"/><path d="M1124 139L981.106 221.5V386.5L1124 469L1266.89 386.5V221.5L1124 139Z" fill="#FFA3A3"/><path opacity="0.5" d="M1124 194L1028.74 249V359L1124 414L1219.26 359V249L1124 194Z" fill="#C15151"/><path d="M1285 291L1243.43 315V363L1285 387L1326.57 363V315L1285 291Z" fill="#A9B0F5"/><path d="M1108 -78L1031.79 -34V54L1108 98L1184.21 54V-34L1108 -78Z" fill="#BEC2CA"/><path opacity="0.5" d="M1107.5 -50L1056.84 -20.25V39.25L1107.5 69L1158.16 39.25V-20.25L1107.5 -50Z" fill="#69717F"/><path d="M1200.59 -181.179V20.1777L1371.5 120.839L1542.41 20.1777V-181.179L1371.5 -281.84L1200.59 -181.179Z" stroke="#BEC2CA" stroke-width="2"/><path d="M1371.5 -251L1222.11 -165V7L1371.5 93L1520.89 7V-165L1371.5 -251Z" fill="#BEC2CA"/><path opacity="0.5" d="M1371.5 -195L1271.47 -137V-21L1371.5 37L1471.53 -21V-137L1371.5 -195Z" fill="#69717F"/><path d="M1315.41 113.32V229.679L1414 287.839L1512.59 229.679V113.32L1414 55.1602L1315.41 113.32Z" stroke="#FFA3A3" stroke-width="2"/><path d="M1414 72L1327.4 122V222L1414 272L1500.6 222V122L1414 72Z" fill="#FFA3A3"/><path opacity="0.5" d="M1414 105L1355.98 138.5V205.5L1414 239L1472.02 205.5V138.5L1414 105Z" fill="#C15151"/><path d="M1363 56L1339.62 69.5V96.5L1363 110L1386.38 96.5V69.5L1363 56Z" fill="#FFCD78"/><path opacity="0.5" d="M1363 65L1347.41 74V92L1363 101L1378.59 92V74L1363 65Z" fill="#C97E19"/><path d="M1321 -50L1279.43 -26V22L1321 46L1362.57 22V-26L1321 -50Z" fill="#A9B0F5"/><path opacity="0.5" d="M1321 -34L1293.29 -18V14L1321 30L1348.71 14V-18L1321 -34Z" fill="#5962B7"/><path d="M756 256L686.718 296V376L756 416L825.282 376V296L756 256Z" fill="#FFCD78"/><path opacity="0.5" d="M756 283L710.101 309.5V362.5L756 389L801.899 362.5V309.5L756 283Z" fill="#C97E19"/><path d="M861.637 -14.9229V40.9219L910 68.8447L958.363 40.9219V-14.9229L910 -42.8457L861.637 -14.9229Z" stroke="#FFCD78" stroke-width="2"/><path d="M910 -29L873.627 -8V34L910 55L946.373 34V-8L910 -29Z" fill="#FFCD78"/><path opacity="0.5" d="M910 -14L886.617 -0.5V26.5L910 40L933.383 26.5V-0.5L910 -14Z" fill="#C97E19"/><path d="M788 155L764.617 168.5V195.5L788 209L811.383 195.5V168.5L788 155Z" fill="#FFCD78"/><path opacity="0.5" d="M788 164L772.412 173V191L788 200L803.588 191V173L788 164Z" fill="#C97E19"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 417.531)" stroke="#BEC2CA" stroke-width="2"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 441.758)" stroke="#BEC2CA" stroke-width="2"/><line y1="-1" x2="484.534" y2="-1" transform="matrix(-0.866025 -0.5 -0.5 0.866025 1235.67 465.984)" stroke="#BEC2CA" stroke-width="2"/></g><defs><clipPath id="ef_hex_def"><rect width="1440" height="292" fill="white"/></clipPath></defs></svg>';
function ji(e) {
  return `url("data:image/svg+xml,${encodeURIComponent(e === "profile" ? Zi : Hi)}")`;
}
function Wi(e) {
  return e === "talent-acquisition" ? "linear-gradient(180deg, color-mix(in srgb, var(--color-background2-blue) 50%, transparent) 0%, var(--background) 92%)" : "linear-gradient(180deg, color-mix(in srgb, var(--color-background1-grey) 65%, transparent) 0%, var(--color-background2-grey) 95%)";
}
function zi(e, t) {
  const n = !!t.src?.trim(), r = !n && t.hexagonsVariant != null, o = e === "career-hub" && !n && !r && t.chevronsVariant != null;
  return n && t.src ? {
    hasImage: !0,
    isChevrons: !1,
    isHexagons: !1,
    fillStyle: {
      backgroundImage: t.imageScrim ? `${Wi(e)}, url(${t.src})` : `url(${t.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }
  } : r && t.hexagonsVariant ? {
    hasImage: !1,
    isChevrons: !1,
    isHexagons: !0,
    fillStyle: {
      backgroundImage: ji(t.hexagonsVariant),
      backgroundPosition: "right top",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover"
    }
  } : o && t.chevronsVariant ? {
    hasImage: !1,
    isChevrons: !0,
    isHexagons: !1,
    fillStyle: {
      backgroundColor: "var(--color-background1-grey)",
      backgroundImage: $i(t.chevronsVariant),
      backgroundPosition: "right top",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover"
    }
  } : {
    hasImage: !1,
    isChevrons: !1,
    isHexagons: !1,
    fillStyle: void 0
  };
}
const Tr = u.forwardRef(
  ({
    className: e,
    variant: t,
    src: n,
    imageScrim: r = !0,
    chevronsVariant: o,
    hexagonsVariant: i,
    children: s,
    ...l
  }, c) => {
    const { fillStyle: f, hasImage: d, isChevrons: p, isHexagons: m } = zi(t, {
      src: n,
      imageScrim: r,
      chevronsVariant: o,
      hexagonsVariant: i
    });
    return /* @__PURE__ */ b(
      "div",
      {
        ref: c,
        "data-slot": "product-background",
        "data-variant": t,
        className: x("relative isolate w-full overflow-hidden", e),
        ...l,
        children: [
          /* @__PURE__ */ a(
            "div",
            {
              "aria-hidden": !0,
              "data-slot": "product-background-fill",
              ...d ? { "data-has-image": "" } : {},
              ...p ? { "data-ch-chevrons": "" } : {},
              ...m ? { "data-hexagons": "" } : {},
              className: x(
                "pointer-events-none absolute inset-0 -z-10",
                (d || p || m) && "min-h-full min-w-full"
              ),
              style: f
            }
          ),
          /* @__PURE__ */ a("div", { className: "relative min-h-0", children: s })
        ]
      }
    );
  }
);
Tr.displayName = "ProductBackground";
const Bd = "/eightfold-logo.svg", $d = "/ai-agent.svg", Ui = "/copilot.svg", Zd = ["talent-acquisition", "career-hub"], Ki = {
  campaigns: "Campaigns",
  "career-exchange": "Career Exchange",
  "career-hub": "Career Hub",
  "customer-community": "Customer Community",
  "resource-management": "Resource management",
  "talent-acquisition": "Talent Acquisition",
  "talent-design": "Talent Design",
  "talent-flex": "Talent Flex",
  "talent-university": "Talent University"
}, Ue = "/product-logos", Me = {
  campaigns: { small: "campaigns-small.svg", medium: "campaigns-medium.svg" },
  "career-exchange": { small: "career-exchange-small.svg", medium: "career-exchange-medium.svg" },
  "career-hub": { small: "career-hub-small.svg", medium: "career-hub-medium.svg" },
  "customer-community": { small: "customer-community-small.svg", medium: "customer-community-medium.svg" },
  "resource-management": { small: "resource-management-small.svg", medium: "resource-management-medium.svg" },
  "talent-acquisition": { small: "talent-acquisition-small.svg", medium: "talent-acquisition-medium.svg" },
  "talent-design": { small: "talent-design-small.svg", medium: "talent-design-medium.svg" },
  "talent-flex": { small: "talent-flex-small.svg", medium: "talent-flex-medium.svg" },
  "talent-university": { small: "talent-university-small.svg", medium: "talent-university-medium.svg" }
};
function Hd(e, t = "medium") {
  return `${Ue}/${Me[e][t]}`;
}
function jd(e, t = "medium") {
  return {
    productName: Ki[e],
    productIconSrc: `${Ue}/${Me[e][t]}`
  };
}
const Wd = Object.keys(Me).reduce(
  (e, t) => (e[t] = {
    small: `${Ue}/${Me[t].small}`,
    medium: `${Ue}/${Me[t].medium}`
  }, e),
  {}
), zd = [
  { label: "My Profile", path: "/profile" },
  { label: "Settings", path: "/settings" },
  { label: "Help", path: "/help" },
  { label: "Sign out", path: "/sign-out" }
], Qt = [
  { label: "My Jobs", path: "/my-activity/jobs" },
  { label: "My Experts", path: "/my-activity/experts" },
  { label: "My Projects", path: "/my-activity/projects" },
  { label: "My Courses", path: "/my-activity/courses" },
  { label: "My Referrals", path: "/my-activity/referrals" },
  { label: "My skill assessment requests", path: "/my-activity/skill-assessments" },
  { label: "Development Plan Templates", path: "/my-activity/dev-plan-templates" }
], Jt = [
  { label: "Projects", path: "/marketplace/projects" },
  { label: "Jobs", path: "/marketplace/jobs" },
  { label: "Courses", path: "/marketplace/courses" },
  { label: "Development Plans", path: "/marketplace/development-plans" },
  { label: "Nectar", path: "/marketplace/nectar" },
  { label: "Google Drive", path: "/marketplace/google-drive" }
], Ud = [
  { label: "Career Interests", path: "/profile?tab=career" },
  { label: "Career Navigator", path: "/career-navigator" },
  { label: "Resume Coach", path: "/resume-coach" }
], Kd = [
  { id: "home", label: "Home", path: "/" },
  { id: "goals", label: "Goals", path: "/goals" },
  { id: "career-navigator", label: "Career navigator", path: "/career-navigator" },
  {
    id: "marketplace",
    label: "Marketplace",
    path: "/marketplace",
    chevron: !0,
    subItems: [...Jt]
  },
  {
    id: "my-activity",
    label: "My activity",
    path: "/my-activity",
    chevron: !0,
    subItems: [...Qt]
  },
  { id: "people", label: "People", path: "/people" }
], Gd = [
  { id: "home", label: "Home", path: "/" },
  { id: "goals", label: "Goals", path: "/goals" },
  { id: "career-navigator", label: "Career navigator", path: "/career-navigator" },
  {
    id: "marketplace",
    label: "Marketplace",
    path: "/marketplace",
    chevron: !0,
    subItems: [...Jt]
  },
  {
    id: "my-activity",
    label: "My activity",
    path: "/my-activity",
    chevron: !0,
    subItems: [...Qt]
  },
  { id: "people", label: "People", path: "/people" },
  { id: "my-team", label: "My team", path: "/my-team" },
  { id: "workforce", label: "Workforce Readiness", path: "/workforce" }
], Yd = [
  { id: "home", label: "Home", path: "/" },
  { id: "my-activity", label: "My activity", path: "/my-activity" },
  { id: "people", label: "People", path: "/people" },
  { id: "my-team", label: "My team", path: "/my-team" },
  { id: "workforce", label: "Workforce Readiness", path: "/workforce" },
  { id: "insights", label: "Insights", path: "/insights" },
  {
    id: "more",
    label: "More",
    path: "/more",
    chevron: !0,
    hideViewAll: !0,
    subItems: [
      { label: "Goals", path: "/goals" },
      { label: "Career navigator", path: "/career-navigator" },
      { label: "Marketplace", path: "/marketplace" }
    ]
  }
], Xd = [
  { id: "home", label: "Home", path: "/" },
  { id: "my-goals", label: "My goals", path: "/goals" },
  { id: "career-navigator", label: "Career navigator", path: "/career-navigator" },
  {
    id: "marketplace",
    label: "Marketplace",
    path: "/marketplace",
    chevron: !0,
    subItems: [...Jt]
  },
  {
    id: "my-activity",
    label: "My activity",
    path: "/my-activity",
    chevron: !0,
    subItems: [...Qt]
  },
  { id: "people", label: "People", path: "/people" },
  { id: "my-team", label: "My team", path: "/my-team" },
  { id: "workforce", label: "Workforce Readiness", path: "/workforce" }
], qd = [
  { id: "positions", label: "Positions", path: "/positions" },
  {
    id: "talent",
    label: "Talent",
    path: "/talent",
    chevron: !0,
    subItems: [
      { label: "Pipeline", path: "/talent/pipeline" },
      { label: "Candidates", path: "/talent/candidates" },
      { label: "Search", path: "/talent/search" }
    ]
  },
  {
    id: "engage",
    label: "Engage",
    path: "/engage",
    chevron: !0,
    subItems: [
      { label: "Campaigns", path: "/engage/campaigns" },
      { label: "Emails", path: "/engage/emails" },
      { label: "Events", path: "/engage/events" }
    ]
  },
  { id: "insights", label: "Insights", path: "/insights" },
  {
    id: "more",
    label: "More",
    path: "/more",
    chevron: !0,
    subItems: [
      { label: "Settings", path: "/more/settings" },
      { label: "Integrations", path: "/more/integrations" },
      { label: "Help", path: "/more/help" }
    ]
  }
], Qd = "Search for positions or candidates", Jd = [
  { iconSrc: Ui, ariaLabel: "Copilot" },
  { icon: "work_outline", ariaLabel: "Talent" },
  { icon: "notifications", ariaLabel: "Notifications" }
];
function eu({
  chSize: e = "parent",
  title: t,
  secondary: n,
  actions: r,
  navbarProps: o,
  chevronsVariant: i,
  hexagonsVariant: s,
  children: l
}) {
  const c = i ?? (e === "profile" ? "profile" : "default");
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("div", { className: "career-hub-shell", children: /* @__PURE__ */ a(Fi, { ...o }) }),
    /* @__PURE__ */ a(Tr, { variant: "career-hub", ...s ? { hexagonsVariant: s } : { chevronsVariant: c }, children: /* @__PURE__ */ a("div", { className: "career-hub-shell", children: /* @__PURE__ */ a(Mr, { variant: "career-hub", chSize: e, overlayBackground: !0, children: /* @__PURE__ */ a(Rr, { actions: r, children: /* @__PURE__ */ b(Fr, { children: [
      /* @__PURE__ */ a(Ar, { children: t }),
      n && /* @__PURE__ */ a(Pr, { children: n })
    ] }) }) }) }) }),
    l
  ] });
}
const Ln = {
  inbox: "no-data",
  "no-connection": "technical-error",
  "no-messages": "conversations",
  "all-done": "tasks-complete",
  "no-items": "alert",
  "no-files": "no-documents",
  error: "technical-error"
}, Gi = {
  conversations: "No conversations",
  "no-data": "No data",
  "no-documents": "No documents",
  "no-search-results": "No search results",
  "no-successor": "No successor",
  "tasks-complete": "All tasks complete",
  "technical-error": "Technical error",
  "unclaimed-profile": "Unclaimed profile",
  alert: "Alert"
}, Yi = {
  conversations: 184,
  "no-data": 184,
  "no-documents": 184,
  "no-search-results": 184,
  "no-successor": 187,
  "tasks-complete": 184,
  "technical-error": 185,
  "unclaimed-profile": 187,
  alert: 184
};
function Xi() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M131.098 145.069C125.349 140.58 119.665 136.448 116.52 133.384C116.016 132.893 115.288 132.671 114.598 132.81C35.5718 148.779 -9.97428 65.6821 65.669 27.1035C65.7558 27.0592 65.8525 27.0185 65.9449 26.9875C142.983 1.22161 204.241 81.5443 135.362 124.844C134.772 125.214 134.381 125.876 134.381 126.572L134.381 143.483C134.381 145.166 132.424 146.105 131.098 145.069Z", fill: "white", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M66.3926 69.6641C70.9586 69.6641 74.3926 73.6234 74.3926 78.1641C74.3926 82.7047 70.9586 86.6641 66.3926 86.6641C61.8266 86.6641 58.3926 82.7047 58.3926 78.1641C58.3926 73.6234 61.8266 69.6641 66.3926 69.6641Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "4" }),
    /* @__PURE__ */ a("path", { d: "M94.3926 69.6641C98.9586 69.6641 102.393 73.6234 102.393 78.1641C102.393 82.7047 98.9586 86.6641 94.3926 86.6641C89.8266 86.6641 86.3926 82.7047 86.3926 78.1641C86.3926 73.6234 89.8266 69.6641 94.3926 69.6641Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "4" }),
    /* @__PURE__ */ a("path", { d: "M122.393 69.6641C126.959 69.6641 130.393 73.6234 130.393 78.1641C130.393 82.7047 126.959 86.6641 122.393 86.6641C117.827 86.6641 114.393 82.7047 114.393 78.1641C114.393 73.6234 117.827 69.6641 122.393 69.6641Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "4" })
  ] });
}
function qi() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M26 108L38.5 59H160.5L174 108V154H26V108Z", fill: "white" }),
    /* @__PURE__ */ a("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M118.495 108.258C118.495 117.504 110.214 123.333 99.9993 123.333C89.7843 123.333 81.5034 117.504 81.5034 108.258C81.5034 107.958 81.5121 105.994 81.5293 105.698H46.666L60.2683 72.6258C60.8547 71.0563 62.4813 70 64.3116 70H135.687C137.517 70 139.144 71.0563 139.73 72.6258L153.333 105.698H118.469C118.487 105.994 118.495 107.958 118.495 108.258Z", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M152.505 59.9987L47.4938 59.9994C43.6128 59.9994 40.0926 62.653 38.7909 66.7154L27.5922 101.665L74.0905 101.665C78.722 101.665 83.0934 103.871 86.0399 107.653L92.9658 116.541C96.6469 121.265 103.355 121.264 107.037 116.541L113.962 107.653C116.909 103.871 121.28 101.665 125.912 101.665L172.408 101.665L161.208 66.7146C159.906 62.6522 156.386 59.9987 152.505 59.9987ZM173.651 108.331L125.912 108.331C123.217 108.331 120.638 109.614 118.876 111.874L111.951 120.762C105.729 128.746 94.2733 128.746 88.0518 120.762L81.126 111.874C79.3647 109.614 76.7854 108.331 74.0906 108.331L26.3492 108.332L26.3493 143.332C26.3493 148.933 30.548 153.332 35.5634 153.332L164.436 153.332C169.452 153.332 173.65 148.933 173.651 143.332L173.651 108.331ZM47.4937 53.3327L152.505 53.332C159.195 53.332 165.081 57.8959 167.226 64.5886L180 104.452L180 143.332C180 152.458 173.105 159.998 164.436 159.998L35.5635 159.999C26.8946 159.999 20.0001 152.459 20 143.332L20 104.452L32.7731 64.5895C34.9176 57.8968 40.804 53.3327 47.4937 53.3327Z", fill: "#8ED0FA" }),
    /* @__PURE__ */ a("rect", { x: "95.668", width: "8", height: "40", rx: "4", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("rect", { x: "49", y: "4", width: "8", height: "40", rx: "4", transform: "rotate(-30 49 4)", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("rect", { x: "144", width: "8", height: "40", rx: "4", transform: "rotate(30 144 0)", fill: "#B0F3FE" })
  ] });
}
function Qi() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M38.6945 42.9038L83.3399 31L125.713 55.3439L143.622 121.853C144.415 124.797 143.96 127.61 142.257 130.292C140.775 133.1 138.467 134.922 135.334 135.758L68.4963 153.579C65.3633 154.414 62.3623 154.007 59.4932 152.359C56.8449 150.838 55.1243 148.605 54.3315 145.66L30.4061 56.8088C29.6133 53.8644 29.9813 51.0746 31.5104 48.4393C33.1668 45.5843 35.5615 43.7392 38.6945 42.9038Z", fill: "white" }),
    /* @__PURE__ */ a("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M39.1955 46.7691C36.7757 47.4174 34.9668 48.8057 33.6627 51.0646C32.4949 53.0872 32.2234 55.1493 32.8299 57.4131L56.7005 146.499C57.3071 148.763 58.5733 150.413 60.596 151.581C62.8548 152.885 65.1155 153.183 67.5352 152.535L134.22 134.667C136.634 134.02 138.317 132.673 139.44 130.535L139.49 130.44L139.548 130.349C140.864 128.266 141.173 126.216 140.585 124.022L123.006 58.4153L82.6613 35.1224L39.1955 46.7691ZM28.9991 48.372C31.0002 44.906 33.9697 42.5942 37.8017 41.5675L83.4221 29.3435L127.63 54.867L145.787 122.629C146.772 126.305 146.193 129.865 144.157 133.134C142.319 136.575 139.416 138.849 135.613 139.868L68.929 157.736C65.097 158.763 61.3695 158.246 57.9034 156.245C54.6415 154.361 52.4744 151.534 51.4989 147.893L27.6284 58.8068C26.6529 55.1662 27.1158 51.6339 28.9991 48.372Z", fill: "#8ED0FA" }),
    /* @__PURE__ */ a("path", { d: "M70.5673 22H116.567L151 56.8545V126.563C151 129.649 149.834 132.282 147.503 134.46C145.351 136.82 142.661 138 139.433 138H70.5673C67.3392 138 64.5595 136.82 62.2281 134.46C60.076 132.282 59 129.649 59 126.563V33.4366C59 30.3505 60.076 27.7183 62.2281 25.5399C64.5595 23.18 67.3392 22 70.5673 22Z", fill: "white" }),
    /* @__PURE__ */ a("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M70.3451 25.4179C67.8301 25.4179 65.7152 26.296 63.8635 28.1516C62.2055 29.8132 61.4064 31.7465 61.4064 34.1044V126.896C61.4064 129.254 62.2055 131.187 63.8635 132.848C65.7152 134.704 67.8301 135.582 70.3451 135.582H139.655C142.164 135.582 144.147 134.711 145.791 132.926L145.864 132.847L145.944 132.773C147.761 131.092 148.594 129.18 148.594 126.896V58.5599L115.522 25.4179H70.3451ZM60.0406 24.3206C62.8819 21.4733 66.3622 20 70.3451 20H117.762L154 56.3158V126.896C154 130.725 152.514 134.033 149.69 136.681C147.013 139.546 143.607 141 139.655 141H70.3451C66.3622 141 62.8819 139.527 60.0406 136.679C57.3668 134 56 130.688 56 126.896V34.1044C56 30.3124 57.3668 27.0002 60.0406 24.3206Z", fill: "#8ED0FA" }),
    /* @__PURE__ */ a("path", { d: "M168.294 70C169.721 70 171.081 70.3672 172.309 71.1084L172.625 71.2988L172.886 71.5615L179.607 78.3232C180.812 79.5356 181.151 81.1074 181.151 82.4668C181.151 83.8801 180.792 85.2972 179.885 86.5146L179.811 86.6143L179.728 86.708C179.391 87.0887 179.141 87.4022 178.957 87.6514C179.12 87.873 179.337 88.1445 179.62 88.4697C180.617 89.3464 181.568 90.3309 182.126 91.3936C182.734 92.4457 183.18 93.78 182.927 95.2393C182.83 96.4843 182.267 97.5721 181.696 98.4111C181.048 99.3646 180.163 100.326 179.13 101.291L167.305 113.414L165.178 115.596L163.029 113.435L158.549 108.927L158.131 108.506L138.616 128.303L137.735 129.196H122.502V129.18L120.217 129.599L119.949 129.647H112.661L112.071 127.412L110.406 121.099L100.167 130.238L99.3135 131H87.3516L88.0566 127.42L92.7617 103.527L93.2383 101.106H106.566L105.811 104.721L104.87 109.213L108.137 106.524L108.968 105.84H119.595L120.135 108.16L121.955 115.986C122.017 115.985 122.079 115.983 122.142 115.983H122.502V113.922L123.366 113.046L150.475 85.5459L151.959 84.0391L151.695 83.7734L153.891 81.6592L164.42 71.5156L164.421 71.5176C165.523 70.4348 166.918 70 168.294 70Z", fill: "#7BE4F4", stroke: "white", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M185 32C190.192 32 194 36.4839 194 41.5C194 46.5161 190.192 51 185 51C179.808 51 176 46.5161 176 41.5C176 36.4839 179.808 32 185 32Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M22 14C27.1921 14 31 18.4839 31 23.5C31 28.5161 27.1921 33 22 33C16.8079 33 13 28.5161 13 23.5C13 18.4839 16.8079 14 22 14Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "42", cy: "8.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("ellipse", { cx: "119", cy: "6.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("line", { x1: "152", y1: "19", x2: "134", y2: "19", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "143", y1: "28", x2: "143", y2: "10", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "21", y1: "90", x2: "3", y2: "90", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "12", y1: "99", x2: "12", y2: "81", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" })
  ] });
}
function Ji() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M183 72C188.192 72 192 76.4839 192 81.5C192 86.5161 188.192 91 183 91C177.808 91 174 86.5161 174 81.5C174 76.4839 177.808 72 183 72Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("circle", { cx: "139", cy: "47", r: "5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("rect", { x: "148", y: "42", width: "20", height: "10", rx: "5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("rect", { x: "10", y: "83", width: "14", height: "10", rx: "5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { d: "M111.824 36.9417C130.569 55.6869 130.569 86.0788 111.824 104.824C93.0788 123.569 62.6869 123.569 43.9417 104.824C25.1965 86.0788 25.1965 55.6869 43.9417 36.9417C62.6869 18.1965 93.0788 18.1965 111.824 36.9417Z", fill: "white" }),
    /* @__PURE__ */ a("path", { d: "M127.38 131.694C124.256 128.57 124.256 123.504 127.38 120.38C130.504 117.256 135.57 117.256 138.694 120.38L155.664 137.351C158.789 140.475 158.789 145.54 155.664 148.665C152.54 151.789 147.475 151.789 144.351 148.665L127.38 131.694Z", fill: "white" }),
    /* @__PURE__ */ a("path", { d: "M125.26 118.259L118.189 111.188M111.824 36.9417C130.569 55.6869 130.569 86.0788 111.824 104.824C93.0788 123.569 62.6869 123.569 43.9417 104.824C25.1965 86.0788 25.1965 55.6869 43.9417 36.9417C62.6869 18.1965 93.0788 18.1965 111.824 36.9417ZM155.664 148.665C152.54 151.789 147.475 151.789 144.351 148.665L127.38 131.694C124.256 128.57 124.256 123.504 127.38 120.38C130.504 117.256 135.57 117.256 138.694 120.38L155.664 137.351C158.789 140.475 158.789 145.54 155.664 148.665Z", stroke: "#8ED0FA", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("path", { d: "M56.3926 79.6641C60.9586 79.6641 64.3926 83.6234 64.3926 88.1641C64.3926 92.7047 60.9586 96.6641 56.3926 96.6641C51.8266 96.6641 48.3926 92.7047 48.3926 88.1641C48.3926 83.6234 51.8266 79.6641 56.3926 79.6641Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "4" })
  ] });
}
function es() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 180.839C21.8078 174.861 3.66074 165.325 0.510726 153.175C-2.63929 141.025 9.18787 126.359 24.8068 118.637C40.5358 111.029 59.9069 110.449 71.9662 105.257C83.9156 99.9498 88.5731 89.9309 99.9189 80.9985C111.265 72.066 129.299 64.2199 140.372 67.9517C151.555 71.798 155.648 87.2069 164.716 99.6426C173.785 112.078 187.68 121.625 194.904 134.657C202.237 147.804 202.768 164.422 189.061 169.219C175.355 174.016 147.3 166.877 128.36 168.625C109.569 170.288 99.7624 180.823 86.4541 184.955C73.2954 189.004 56.4854 186.734 39.0718 180.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M183 115.819V134H72V115.819L72.4336 111.923C73.0117 108.748 74.168 105.718 75.9023 102.832C77.9258 98.5034 80.6719 94.7517 84.1406 91.5772C88.4766 87.8255 93.9687 84.7953 100.617 82.4866C108.133 79.8893 117.094 78.5906 127.5 78.5906C143.977 78.5906 156.984 81.7651 166.523 88.1141C173.461 92.7315 178.375 98.792 181.266 106.295C182.422 109.758 183 112.933 183 115.819ZM155.25 32.7047C155.25 24.9128 152.504 18.4195 147.012 13.2248C141.809 7.74161 135.305 5 127.5 5C119.984 5 113.48 7.74161 107.988 13.2248C102.496 18.4195 99.75 24.9128 99.75 32.7047C99.75 40.2081 102.496 46.7013 107.988 52.1846C113.48 57.6678 119.984 60.4094 127.5 60.4094C135.305 60.4094 141.809 57.6678 147.012 52.1846C152.504 46.7013 155.25 40.2081 155.25 32.7047Z", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { d: "M159 112.96V131H48V112.96L48.4336 109.094C49.0117 105.944 50.168 102.937 51.9023 100.074C53.9258 95.7785 56.6719 92.0559 60.1406 88.906C64.4766 85.1834 69.9687 82.1767 76.6172 79.8859C84.1328 77.3087 93.0938 76.0201 103.5 76.0201C119.977 76.0201 132.984 79.17 142.523 85.4698C149.461 90.0515 154.375 96.0649 157.266 103.51C158.422 106.946 159 110.096 159 112.96ZM131.25 30.4899C131.25 22.7584 128.504 16.3154 123.012 11.1611C117.809 5.72036 111.305 3 103.5 3C95.9844 3 89.4805 5.72036 83.9883 11.1611C78.4961 16.3154 75.75 22.7584 75.75 30.4899C75.75 37.9351 78.4961 44.3781 83.9883 49.8188C89.4805 55.2595 95.9844 57.9799 103.5 57.9799C111.305 57.9799 117.809 55.2595 123.012 49.8188C128.504 44.3781 131.25 37.9351 131.25 30.4899Z", fill: "white" }),
    /* @__PURE__ */ a("path", { d: "M159 112.96V131H48V112.96L48.4336 109.094C49.0117 105.944 50.168 102.937 51.9023 100.074C53.9258 95.7785 56.6719 92.0559 60.1406 88.906C64.4766 85.1834 69.9687 82.1767 76.6172 79.8859C84.1328 77.3087 93.0938 76.0201 103.5 76.0201C119.977 76.0201 132.984 79.17 142.523 85.4698C149.461 90.0515 154.375 96.0649 157.266 103.51C158.422 106.946 159 110.096 159 112.96ZM131.25 30.4899C131.25 22.7584 128.504 16.3154 123.012 11.1611C117.809 5.72036 111.305 3 103.5 3C95.9844 3 89.4805 5.72036 83.9883 11.1611C78.4961 16.3154 75.75 22.7584 75.75 30.4899C75.75 37.9351 78.4961 44.3781 83.9883 49.8188C89.4805 55.2595 95.9844 57.9799 103.5 57.9799C111.305 57.9799 117.809 55.2595 123.012 49.8188C128.504 44.3781 131.25 37.9351 131.25 30.4899Z", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M69 52.9545L58.65 40L25.4438 73.25L10.7812 58.5682L0 69.3636L25.4438 97L69 52.9545Z", fill: "#B0F3FE" })
  ] });
}
function ts() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M180 79C185.192 79 189 83.4839 189 88.5C189 93.5161 185.192 98 180 98C174.808 98 171 93.5161 171 88.5C171 83.4839 174.808 79 180 79Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("circle", { cx: "139", cy: "47", r: "5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { d: "M56.3926 79.6641C60.9586 79.6641 64.3926 83.6234 64.3926 88.1641C64.3926 92.7047 60.9586 96.6641 56.3926 96.6641C51.8266 96.6641 48.3926 92.7047 48.3926 88.1641C48.3926 83.6234 51.8266 79.6641 56.3926 79.6641Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "4" }),
    /* @__PURE__ */ a("circle", { cx: "98", cy: "79", r: "60", fill: "white", stroke: "#8ED0FA", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("path", { d: "M80.9802 73.3685C79.5239 72.0567 77.2649 72.1574 75.9346 73.5935C74.6043 75.0295 74.7064 77.2571 76.1627 78.569L92.971 93.7098C95.0099 95.5463 98.1725 95.4053 100.035 93.3948C100.113 93.3094 100.113 93.3094 100.188 93.2217L124.175 64.7735C125.436 63.2779 125.228 61.0574 123.712 59.8139C122.195 58.5703 119.943 58.7747 118.682 60.2703L96.1309 87.0162L80.9802 73.3685Z", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { d: "M16 7C21.1921 7 25 11.4839 25 16.5C25 21.5161 21.1921 26 16 26C10.8079 26 7 21.5161 7 16.5C7 11.4839 10.8079 7 16 7Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "38", cy: "35.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("ellipse", { cx: "171", cy: "35.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("line", { x1: "160", y1: "13", x2: "142", y2: "13", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "151", y1: "22", x2: "151", y2: "4", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "31", y1: "87", x2: "13", y2: "87", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "22", y1: "96", x2: "22", y2: "78", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" })
  ] });
}
function ns() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 178.839C21.8078 172.861 3.66074 163.325 0.510726 151.175C-2.63929 139.025 9.18787 124.359 24.8068 116.637C40.5358 109.029 59.9069 108.449 71.9662 103.257C83.9156 97.9498 88.5731 87.9309 99.9189 78.9985C111.265 70.066 129.299 62.2199 140.372 65.9517C151.555 69.798 155.648 85.2069 164.716 97.6426C173.785 110.078 187.68 119.625 194.904 132.657C202.237 145.804 202.768 162.422 189.061 167.219C175.355 172.016 147.3 164.877 128.36 166.625C109.569 168.288 99.7624 178.823 86.4541 182.955C73.2954 187.004 56.4854 184.734 39.0718 178.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M49.2784 101.405C39.3247 57.4604 105.676 18.8428 136.863 78.7671C196.578 76.1036 191.934 156.002 145.489 158L107.668 158L46.6243 158C12.7837 158 0.841885 104.068 49.2784 101.405Z", fill: "white", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M78.1406 100.977L84.5381 107.374C85.3191 108.155 85.3191 109.421 84.5381 110.202L78.5013 116.239", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M126.451 116.238L120.054 109.841C119.273 109.06 119.273 107.793 120.054 107.012L126.09 100.976", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M102 123C107.192 123 111 127.484 111 132.5C111 137.516 107.192 142 102 142C96.8079 142 93 137.516 93 132.5C93 127.484 96.8079 123 102 123Z", fill: "#B0F3FE", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M161 49C166.192 49 170 53.4839 170 58.5C170 63.5161 166.192 68 161 68C155.808 68 152 63.5161 152 58.5C152 53.4839 155.808 49 161 49Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M55 3C60.1921 3 64 7.48391 64 12.5C64 17.5161 60.1921 22 55 22C49.8079 22 46 17.5161 46 12.5C46 7.48391 49.8079 3 55 3Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "108", cy: "29.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("ellipse", { cx: "28", cy: "89.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("line", { x1: "161.334", y1: "11.6059", x2: "148.606", y2: "24.3338", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "161.335", y1: "24.3359", x2: "148.608", y2: "11.608", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "31.334", y1: "38.6059", x2: "18.6061", y2: "51.3338", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "31.3355", y1: "51.3359", x2: "18.6076", y2: "38.608", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" })
  ] });
}
function rs() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 180.839C21.8078 174.861 3.66074 165.325 0.510726 153.175C-2.63929 141.025 9.18787 126.359 24.8068 118.637C40.5358 111.029 59.9069 110.449 71.9662 105.257C83.9156 99.9498 88.5731 89.9309 99.9189 80.9985C111.265 72.066 129.299 64.2199 140.372 67.9517C151.555 71.798 155.648 87.2069 164.716 99.6426C173.785 112.078 187.68 121.625 194.904 134.657C202.237 147.804 202.768 164.422 189.061 169.219C175.355 174.016 147.3 166.877 128.36 168.625C109.569 170.288 99.7624 180.823 86.4541 184.955C73.2954 189.004 56.4854 186.734 39.0718 180.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M159 112.96V131H48V112.96L48.4336 109.094C49.0117 105.944 50.168 102.937 51.9023 100.074C53.9258 95.7785 56.6719 92.0559 60.1406 88.906C64.4766 85.1834 69.9687 82.1767 76.6172 79.8859C84.1328 77.3087 93.0938 76.0201 103.5 76.0201C119.977 76.0201 132.984 79.17 142.523 85.4698C149.461 90.0515 154.375 96.0649 157.266 103.51C158.422 106.946 159 110.096 159 112.96ZM131.25 30.4899C131.25 22.7584 128.504 16.3154 123.012 11.1611C117.809 5.72036 111.305 3 103.5 3C95.9844 3 89.4805 5.72036 83.9883 11.1611C78.4961 16.3154 75.75 22.7584 75.75 30.4899C75.75 37.9351 78.4961 44.3781 83.9883 49.8188C89.4805 55.2595 95.9844 57.9799 103.5 57.9799C111.305 57.9799 117.809 55.2595 123.012 49.8188C128.504 44.3781 131.25 37.9351 131.25 30.4899Z", fill: "white" }),
    /* @__PURE__ */ a("path", { d: "M159 112.96V131H48V112.96L48.4336 109.094C49.0117 105.944 50.168 102.937 51.9023 100.074C53.9258 95.7785 56.6719 92.0559 60.1406 88.906C64.4766 85.1834 69.9687 82.1767 76.6172 79.8859C84.1328 77.3087 93.0938 76.0201 103.5 76.0201C119.977 76.0201 132.984 79.17 142.523 85.4698C149.461 90.0515 154.375 96.0649 157.266 103.51C158.422 106.946 159 110.096 159 112.96ZM131.25 30.4899C131.25 22.7584 128.504 16.3154 123.012 11.1611C117.809 5.72036 111.305 3 103.5 3C95.9844 3 89.4805 5.72036 83.9883 11.1611C78.4961 16.3154 75.75 22.7584 75.75 30.4899C75.75 37.9351 78.4961 44.3781 83.9883 49.8188C89.4805 55.2595 95.9844 57.9799 103.5 57.9799C111.305 57.9799 117.809 55.2595 123.012 49.8188C128.504 44.3781 131.25 37.9351 131.25 30.4899Z", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M46 22C48.8331 22 51.3717 22.7368 53.6875 24.21L53.749 24.249L53.8125 24.2852C56.2511 25.6752 58.1384 27.5927 59.5117 30.0889L59.5469 30.1514L59.584 30.2129C61.0394 32.5832 61.7715 35.192 61.7715 38.1074V48.7861H68.4561C69.7221 48.7861 70.6672 49.2071 71.4971 50.1221L71.5781 50.2109L71.665 50.2939C72.6029 51.1752 73 52.1189 73 53.2861V91.5C73 92.6673 72.6031 93.6109 71.665 94.4922L71.5781 94.5742L71.4971 94.6631C70.6672 95.5782 69.7222 96 68.4561 96H23.5439C22.2707 96 21.2208 95.5693 20.2451 94.5762C19.3993 93.7152 19 92.7466 19 91.5V53.2861C19 52.0396 19.3994 51.0709 20.2451 50.21C21.2208 49.2168 22.2707 48.7861 23.5439 48.7861H30.2285V38.1074C30.2285 35.1545 30.922 32.5199 32.2842 30.1406C33.7952 27.5861 35.7182 25.6469 38.0576 24.2578L38.0742 24.249L38.0898 24.2393C40.548 22.738 43.1658 22 46 22ZM46 61.7139C43.0628 61.7139 40.4871 62.8315 38.4219 64.9336C36.4261 66.965 35.4561 69.5242 35.4561 72.3926C35.4561 75.2594 36.4209 77.8294 38.3389 79.9443L38.4199 80.0332L38.5068 80.1152C40.5892 82.0717 43.1391 83.0713 46 83.0713C48.8641 83.0713 51.4043 82.0659 53.4033 80.0312C55.4673 77.9305 56.5439 75.3328 56.5439 72.3926C56.5439 69.4858 55.4861 66.9317 53.3994 64.9307C51.4339 62.8106 48.9028 61.7139 46 61.7139ZM46 23.6787C42.0336 23.6787 38.5737 25.1355 35.79 27.9688C33.0924 30.7145 31.7715 34.1675 31.7715 38.1074V48.7861H60.2285V38.1074C60.2285 34.1432 58.8311 30.6931 56.0342 27.9678C53.3558 25.1209 49.9425 23.6787 46 23.6787Z", fill: "white", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "46", cy: "72.5", rx: "8", ry: "8.5", fill: "#B0F3FE" })
  ] });
}
function as() {
  return /* @__PURE__ */ b(V, { children: [
    /* @__PURE__ */ a("path", { d: "M39.0718 177.839C21.8078 171.861 3.66074 162.325 0.510726 150.175C-2.63929 138.025 9.18787 123.359 24.8068 115.637C40.5358 108.029 59.9069 107.449 71.9662 102.257C83.9156 96.9498 88.5731 86.9309 99.9189 77.9985C111.265 69.066 129.299 61.2199 140.372 64.9517C151.555 68.798 155.648 84.2069 164.716 96.6426C173.785 109.078 187.68 118.625 194.904 131.657C202.237 144.804 202.768 161.422 189.061 166.219C175.355 171.016 147.3 163.877 128.36 165.625C109.569 167.288 99.7624 177.823 86.4541 181.955C73.2954 186.004 56.4854 183.734 39.0718 177.839Z", fill: "#EBF7FF" }),
    /* @__PURE__ */ a("path", { d: "M180 79C185.192 79 189 83.4839 189 88.5C189 93.5161 185.192 98 180 98C174.808 98 171 93.5161 171 88.5C171 83.4839 174.808 79 180 79Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "139", cy: "47", rx: "5", ry: "5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("path", { d: "M33 10C38.1921 10 42 14.4839 42 19.5C42 24.5161 38.1921 29 33 29C27.8079 29 24 24.5161 24 19.5C24 14.4839 27.8079 10 33 10Z", stroke: "#B0F3FE", strokeWidth: "6" }),
    /* @__PURE__ */ a("ellipse", { cx: "45", cy: "53.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("ellipse", { cx: "171", cy: "35.5", rx: "6", ry: "6.5", fill: "#B0F3FE" }),
    /* @__PURE__ */ a("line", { x1: "156.47", y1: "19.3312", x2: "145.152", y2: "8.11206", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "145.2", y1: "19.0152", x2: "156.419", y2: "7.69643", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "34.9976", y1: "101.738", x2: "21.2471", y2: "87.9878", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("line", { x1: "21.2461", y1: "100.996", x2: "34.9966", y2: "87.2451", stroke: "#B0F3FE", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("path", { d: "M165.086 137.004H36.9141L101 26.0039L165.086 137.004Z", fill: "white", stroke: "#8ED0FA", strokeWidth: "6" }),
    /* @__PURE__ */ a("path", { d: "M101.334 66.668L101.334 104.001", stroke: "#8ED0FA", strokeWidth: "6", strokeLinecap: "round" }),
    /* @__PURE__ */ a("ellipse", { cx: "101.333", cy: "117.333", rx: "5.33333", ry: "5.33333", fill: "#B0F3FE" })
  ] });
}
const os = {
  conversations: Xi,
  "no-data": qi,
  "no-documents": Qi,
  "no-search-results": Ji,
  "no-successor": es,
  "tasks-complete": ts,
  "technical-error": ns,
  "unclaimed-profile": rs,
  alert: as
};
function is({ variant: e, size: t = 200, className: n, ...r }) {
  const o = e in Ln ? Ln[e] : e, i = Yi[o], s = Math.round(t * i / 200), l = os[o];
  return /* @__PURE__ */ a(
    "svg",
    {
      width: t,
      height: s,
      viewBox: `0 0 200 ${i}`,
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-label": Gi[o],
      role: "img",
      className: x("shrink-0", n),
      ...r,
      children: /* @__PURE__ */ a(l, {})
    }
  );
}
is.displayName = "EmptyIllustration";
const ss = {
  neutral: "info",
  success: "check_circle",
  warning: "warning",
  error: "error",
  "ai-agent": "auto_awesome"
};
function tu({
  variant: e = "neutral",
  message: t,
  actionLabel: n,
  onAction: r,
  onClose: o,
  className: i
}) {
  return /* @__PURE__ */ b(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "data-variant": e,
      className: x("ef-infobar", `ef-infobar--${e}`, i),
      children: [
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-infobar__icon", "aria-hidden": !0, children: ss[e] }),
        /* @__PURE__ */ a("span", { className: "ef-infobar__message", children: t }),
        n && r && /* @__PURE__ */ a("button", { type: "button", className: "ef-infobar__action", onClick: r, children: n }),
        o && /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ef-infobar__close",
            onClick: o,
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
          }
        )
      ]
    }
  );
}
const ls = {
  neutral: "info",
  success: "check_circle",
  warning: "warning",
  error: "error"
};
function nu({
  variant: e = "neutral",
  title: t,
  description: n,
  actionLabel: r,
  onAction: o,
  onClose: i,
  className: s
}) {
  return /* @__PURE__ */ b(
    "div",
    {
      role: "alert",
      "data-variant": e,
      className: x("ef-messagebar", `ef-messagebar--${e}`, s),
      children: [
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-messagebar__icon", "aria-hidden": !0, children: ls[e] }),
        /* @__PURE__ */ b("div", { className: "ef-messagebar__body", children: [
          /* @__PURE__ */ a("span", { className: "ef-messagebar__title", children: t }),
          n && /* @__PURE__ */ a("span", { className: "ef-messagebar__description", children: n })
        ] }),
        r && o && /* @__PURE__ */ a("button", { type: "button", className: "ef-messagebar__action", onClick: o, children: r }),
        i && /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ef-messagebar__close",
            onClick: i,
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
          }
        )
      ]
    }
  );
}
const cs = {
  default: "info",
  success: "check_circle",
  warning: "warning",
  error: "error"
};
function ru({
  variant: e = "default",
  message: t,
  actionLabel: n,
  onAction: r,
  onClose: o,
  size: i = "default",
  className: s
}) {
  return /* @__PURE__ */ b(
    "div",
    {
      role: "status",
      "aria-live": "polite",
      "data-variant": e,
      "data-size": i,
      className: x(
        "ef-snackbar",
        `ef-snackbar--${e}`,
        i === "small" && "ef-snackbar--small",
        s
      ),
      children: [
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-snackbar__icon", "aria-hidden": !0, children: cs[e] }),
        /* @__PURE__ */ a("span", { className: "ef-snackbar__message", children: t }),
        n && r && /* @__PURE__ */ a("button", { type: "button", className: "ef-snackbar__action", onClick: r, children: n }),
        o && /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ef-snackbar__close",
            onClick: o,
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
          }
        )
      ]
    }
  );
}
function au({
  children: e,
  className: t
}) {
  return /* @__PURE__ */ a(
    "div",
    {
      "aria-live": "polite",
      "aria-label": "Notifications",
      className: x("ef-snackbar-container", t),
      children: e
    }
  );
}
function ou({
  open: e,
  onClose: t,
  title: n,
  subtitle: r,
  width: o = "medium",
  confirmLabel: i,
  onConfirm: s,
  confirmLoading: l = !1,
  confirmDisabled: c = !1,
  cancelLabel: f = "Cancel",
  children: d,
  className: p
}) {
  return /* @__PURE__ */ a(Z.Root, { open: e, onOpenChange: (m) => {
    m || t();
  }, children: /* @__PURE__ */ b(Z.Portal, { children: [
    /* @__PURE__ */ a(Z.Overlay, { className: "ef-panel__overlay" }),
    /* @__PURE__ */ b(
      Z.Content,
      {
        "data-width": o,
        className: x("ef-panel", `ef-panel--${o}`, p),
        "aria-describedby": void 0,
        children: [
          /* @__PURE__ */ b("div", { className: "ef-panel__header", children: [
            /* @__PURE__ */ b("div", { className: "ef-panel__header-text", children: [
              /* @__PURE__ */ a(Z.Title, { className: "ef-panel__title", children: n }),
              r && /* @__PURE__ */ a(Z.Description, { className: "ef-panel__subtitle", children: r })
            ] }),
            /* @__PURE__ */ a(Z.Close, { className: "ef-panel__close", "aria-label": "Close panel", children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" }) })
          ] }),
          /* @__PURE__ */ a("div", { className: "ef-panel__body", children: d }),
          (i || s) && /* @__PURE__ */ b("div", { className: "ef-panel__footer", children: [
            /* @__PURE__ */ a(
              "button",
              {
                type: "button",
                className: "ef-panel__btn ef-panel__btn--cancel",
                onClick: t,
                children: f
              }
            ),
            /* @__PURE__ */ a(
              "button",
              {
                type: "button",
                className: "ef-panel__btn ef-panel__btn--confirm",
                onClick: s,
                disabled: c || l,
                "aria-busy": l,
                children: l ? /* @__PURE__ */ b(V, { children: [
                  /* @__PURE__ */ a(
                    "span",
                    {
                      className: "material-symbols-outlined ef-panel__spinner",
                      "aria-hidden": !0,
                      children: "progress_activity"
                    }
                  ),
                  i
                ] }) : i
              }
            )
          ] })
        ]
      }
    )
  ] }) });
}
function iu({
  label: e,
  avatarSrc: t,
  avatarInitials: n,
  icon: r,
  size: o = "medium",
  variant: i = "default",
  onRemove: s,
  onClick: l,
  className: c,
  disabled: f = !1
}) {
  const d = !!(t || n), p = !!l && !f;
  return /* @__PURE__ */ b(
    "span",
    {
      role: p ? "button" : void 0,
      tabIndex: p ? 0 : void 0,
      "data-size": o,
      "data-variant": i,
      "data-disabled": f || void 0,
      className: x(
        "ef-chip",
        `ef-chip--${o}`,
        `ef-chip--${i}`,
        p && "ef-chip--interactive",
        c
      ),
      onClick: p ? l : void 0,
      onKeyDown: p ? (m) => {
        (m.key === "Enter" || m.key === " ") && (m.preventDefault(), l?.());
      } : void 0,
      children: [
        d && /* @__PURE__ */ a("span", { className: "ef-chip__avatar", "aria-hidden": !0, children: t ? /* @__PURE__ */ a("img", { src: t, alt: "", className: "ef-chip__avatar-img" }) : /* @__PURE__ */ a("span", { className: "ef-chip__avatar-initials", children: n }) }),
        !d && r && /* @__PURE__ */ a("span", { className: "ef-chip__icon", "aria-hidden": !0, children: r }),
        /* @__PURE__ */ a("span", { className: "ef-chip__label", children: e }),
        s && !f && /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ef-chip__remove",
            onClick: (m) => {
              m.stopPropagation(), s();
            },
            "aria-label": `Remove ${e}`,
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
          }
        )
      ]
    }
  );
}
var ut = 0;
function ds() {
  u.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", e[0] ?? En()), document.body.insertAdjacentElement("beforeend", e[1] ?? En()), ut++, () => {
      ut === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((t) => t.remove()), ut--;
    };
  }, []);
}
function En() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
var ft = "focusScope.autoFocusOnMount", pt = "focusScope.autoFocusOnUnmount", kn = { bubbles: !1, cancelable: !0 }, us = "FocusScope", Or = u.forwardRef((e, t) => {
  const {
    loop: n = !1,
    trapped: r = !1,
    onMountAutoFocus: o,
    onUnmountAutoFocus: i,
    ...s
  } = e, [l, c] = u.useState(null), f = G(o), d = G(i), p = u.useRef(null), m = U(t, (h) => c(h)), g = u.useRef({
    paused: !1,
    pause() {
      this.paused = !0;
    },
    resume() {
      this.paused = !1;
    }
  }).current;
  u.useEffect(() => {
    if (r) {
      let h = function(_) {
        if (g.paused || !l) return;
        const w = _.target;
        l.contains(w) ? p.current = w : ce(p.current, { select: !0 });
      }, y = function(_) {
        if (g.paused || !l) return;
        const w = _.relatedTarget;
        w !== null && (l.contains(w) || ce(p.current, { select: !0 }));
      }, C = function(_) {
        if (document.activeElement === document.body)
          for (const E of _)
            E.removedNodes.length > 0 && ce(l);
      };
      document.addEventListener("focusin", h), document.addEventListener("focusout", y);
      const L = new MutationObserver(C);
      return l && L.observe(l, { childList: !0, subtree: !0 }), () => {
        document.removeEventListener("focusin", h), document.removeEventListener("focusout", y), L.disconnect();
      };
    }
  }, [r, l, g.paused]), u.useEffect(() => {
    if (l) {
      Mn.add(g);
      const h = document.activeElement;
      if (!l.contains(h)) {
        const C = new CustomEvent(ft, kn);
        l.addEventListener(ft, f), l.dispatchEvent(C), C.defaultPrevented || (fs(vs(Dr(l)), { select: !0 }), document.activeElement === h && ce(l));
      }
      return () => {
        l.removeEventListener(ft, f), setTimeout(() => {
          const C = new CustomEvent(pt, kn);
          l.addEventListener(pt, d), l.dispatchEvent(C), C.defaultPrevented || ce(h ?? document.body, { select: !0 }), l.removeEventListener(pt, d), Mn.remove(g);
        }, 0);
      };
    }
  }, [l, f, d, g]);
  const v = u.useCallback(
    (h) => {
      if (!n && !r || g.paused) return;
      const y = h.key === "Tab" && !h.altKey && !h.ctrlKey && !h.metaKey, C = document.activeElement;
      if (y && C) {
        const L = h.currentTarget, [_, w] = ps(L);
        _ && w ? !h.shiftKey && C === w ? (h.preventDefault(), n && ce(_, { select: !0 })) : h.shiftKey && C === _ && (h.preventDefault(), n && ce(w, { select: !0 })) : C === L && h.preventDefault();
      }
    },
    [n, r, g.paused]
  );
  return /* @__PURE__ */ a(H.div, { tabIndex: -1, ...s, ref: m, onKeyDown: v });
});
Or.displayName = us;
function fs(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if (ce(r, { select: t }), document.activeElement !== n) return;
}
function ps(e) {
  const t = Dr(e), n = Sn(t, e), r = Sn(t.reverse(), e);
  return [n, r];
}
function Dr(e) {
  const t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (r) => {
      const o = r.tagName === "INPUT" && r.type === "hidden";
      return r.disabled || r.hidden || o ? NodeFilter.FILTER_SKIP : r.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Sn(e, t) {
  for (const n of e)
    if (!ms(n, { upTo: t })) return n;
}
function ms(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function hs(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function ce(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    e.focus({ preventScroll: !0 }), e !== n && hs(e) && t && e.select();
  }
}
var Mn = gs();
function gs() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      t !== n && n?.pause(), e = Rn(e, t), e.unshift(t);
    },
    remove(t) {
      e = Rn(e, t), e[0]?.resume();
    }
  };
}
function Rn(e, t) {
  const n = [...e], r = n.indexOf(t);
  return r !== -1 && n.splice(r, 1), n;
}
function vs(e) {
  return e.filter((t) => t.tagName !== "A");
}
const bs = ["top", "right", "bottom", "left"], de = Math.min, Y = Math.max, Ke = Math.round, Oe = Math.floor, re = (e) => ({
  x: e,
  y: e
}), ys = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Rt(e, t, n) {
  return Y(e, de(t, n));
}
function ie(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function se(e) {
  return e.split("-")[0];
}
function Ee(e) {
  return e.split("-")[1];
}
function en(e) {
  return e === "x" ? "y" : "x";
}
function tn(e) {
  return e === "y" ? "height" : "width";
}
function ne(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function nn(e) {
  return en(ne(e));
}
function Cs(e, t, n) {
  n === void 0 && (n = !1);
  const r = Ee(e), o = nn(e), i = tn(o);
  let s = o === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[i] > t.floating[i] && (s = Ge(s)), [s, Ge(s)];
}
function _s(e) {
  const t = Ge(e);
  return [At(e), t, At(t)];
}
function At(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const An = ["left", "right"], Fn = ["right", "left"], ws = ["top", "bottom"], xs = ["bottom", "top"];
function Ns(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Fn : An : t ? An : Fn;
    case "left":
    case "right":
      return t ? ws : xs;
    default:
      return [];
  }
}
function Ls(e, t, n, r) {
  const o = Ee(e);
  let i = Ns(se(e), n === "start", r);
  return o && (i = i.map((s) => s + "-" + o), t && (i = i.concat(i.map(At)))), i;
}
function Ge(e) {
  const t = se(e);
  return ys[t] + e.slice(t.length);
}
function Es(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function Ir(e) {
  return typeof e != "number" ? Es(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Ye(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: o
  } = e;
  return {
    width: r,
    height: o,
    top: n,
    left: t,
    right: t + r,
    bottom: n + o,
    x: t,
    y: n
  };
}
function Pn(e, t, n) {
  let {
    reference: r,
    floating: o
  } = e;
  const i = ne(t), s = nn(t), l = tn(s), c = se(t), f = i === "y", d = r.x + r.width / 2 - o.width / 2, p = r.y + r.height / 2 - o.height / 2, m = r[l] / 2 - o[l] / 2;
  let g;
  switch (c) {
    case "top":
      g = {
        x: d,
        y: r.y - o.height
      };
      break;
    case "bottom":
      g = {
        x: d,
        y: r.y + r.height
      };
      break;
    case "right":
      g = {
        x: r.x + r.width,
        y: p
      };
      break;
    case "left":
      g = {
        x: r.x - o.width,
        y: p
      };
      break;
    default:
      g = {
        x: r.x,
        y: r.y
      };
  }
  switch (Ee(t)) {
    case "start":
      g[s] -= m * (n && f ? -1 : 1);
      break;
    case "end":
      g[s] += m * (n && f ? -1 : 1);
      break;
  }
  return g;
}
async function ks(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: o,
    platform: i,
    rects: s,
    elements: l,
    strategy: c
  } = e, {
    boundary: f = "clippingAncestors",
    rootBoundary: d = "viewport",
    elementContext: p = "floating",
    altBoundary: m = !1,
    padding: g = 0
  } = ie(t, e), v = Ir(g), y = l[m ? p === "floating" ? "reference" : "floating" : p], C = Ye(await i.getClippingRect({
    element: (n = await (i.isElement == null ? void 0 : i.isElement(y))) == null || n ? y : y.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(l.floating)),
    boundary: f,
    rootBoundary: d,
    strategy: c
  })), L = p === "floating" ? {
    x: r,
    y: o,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(l.floating)), w = await (i.isElement == null ? void 0 : i.isElement(_)) ? await (i.getScale == null ? void 0 : i.getScale(_)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, E = Ye(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: l,
    rect: L,
    offsetParent: _,
    strategy: c
  }) : L);
  return {
    top: (C.top - E.top + v.top) / w.y,
    bottom: (E.bottom - C.bottom + v.bottom) / w.y,
    left: (C.left - E.left + v.left) / w.x,
    right: (E.right - C.right + v.right) / w.x
  };
}
const Ss = 50, Ms = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: o = "absolute",
    middleware: i = [],
    platform: s
  } = n, l = s.detectOverflow ? s : {
    ...s,
    detectOverflow: ks
  }, c = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let f = await s.getElementRects({
    reference: e,
    floating: t,
    strategy: o
  }), {
    x: d,
    y: p
  } = Pn(f, r, c), m = r, g = 0;
  const v = {};
  for (let h = 0; h < i.length; h++) {
    const y = i[h];
    if (!y)
      continue;
    const {
      name: C,
      fn: L
    } = y, {
      x: _,
      y: w,
      data: E,
      reset: k
    } = await L({
      x: d,
      y: p,
      initialPlacement: r,
      placement: m,
      strategy: o,
      middlewareData: v,
      rects: f,
      platform: l,
      elements: {
        reference: e,
        floating: t
      }
    });
    d = _ ?? d, p = w ?? p, v[C] = {
      ...v[C],
      ...E
    }, k && g < Ss && (g++, typeof k == "object" && (k.placement && (m = k.placement), k.rects && (f = k.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: o
    }) : k.rects), {
      x: d,
      y: p
    } = Pn(f, m, c)), h = -1);
  }
  return {
    x: d,
    y: p,
    placement: m,
    strategy: o,
    middlewareData: v
  };
}, Rs = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: o,
      rects: i,
      platform: s,
      elements: l,
      middlewareData: c
    } = t, {
      element: f,
      padding: d = 0
    } = ie(e, t) || {};
    if (f == null)
      return {};
    const p = Ir(d), m = {
      x: n,
      y: r
    }, g = nn(o), v = tn(g), h = await s.getDimensions(f), y = g === "y", C = y ? "top" : "left", L = y ? "bottom" : "right", _ = y ? "clientHeight" : "clientWidth", w = i.reference[v] + i.reference[g] - m[g] - i.floating[v], E = m[g] - i.reference[g], k = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(f));
    let S = k ? k[_] : 0;
    (!S || !await (s.isElement == null ? void 0 : s.isElement(k))) && (S = l.floating[_] || i.floating[v]);
    const F = w / 2 - E / 2, R = S / 2 - h[v] / 2 - 1, N = de(p[C], R), P = de(p[L], R), O = N, T = S - h[v] - P, M = S / 2 - h[v] / 2 + F, I = Rt(O, M, T), D = !c.arrow && Ee(o) != null && M !== I && i.reference[v] / 2 - (M < O ? N : P) - h[v] / 2 < 0, $ = D ? M < O ? M - O : M - T : 0;
    return {
      [g]: m[g] + $,
      data: {
        [g]: I,
        centerOffset: M - I - $,
        ...D && {
          alignmentOffset: $
        }
      },
      reset: D
    };
  }
}), As = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        middlewareData: i,
        rects: s,
        initialPlacement: l,
        platform: c,
        elements: f
      } = t, {
        mainAxis: d = !0,
        crossAxis: p = !0,
        fallbackPlacements: m,
        fallbackStrategy: g = "bestFit",
        fallbackAxisSideDirection: v = "none",
        flipAlignment: h = !0,
        ...y
      } = ie(e, t);
      if ((n = i.arrow) != null && n.alignmentOffset)
        return {};
      const C = se(o), L = ne(l), _ = se(l) === l, w = await (c.isRTL == null ? void 0 : c.isRTL(f.floating)), E = m || (_ || !h ? [Ge(l)] : _s(l)), k = v !== "none";
      !m && k && E.push(...Ls(l, h, v, w));
      const S = [l, ...E], F = await c.detectOverflow(t, y), R = [];
      let N = ((r = i.flip) == null ? void 0 : r.overflows) || [];
      if (d && R.push(F[C]), p) {
        const M = Cs(o, s, w);
        R.push(F[M[0]], F[M[1]]);
      }
      if (N = [...N, {
        placement: o,
        overflows: R
      }], !R.every((M) => M <= 0)) {
        var P, O;
        const M = (((P = i.flip) == null ? void 0 : P.index) || 0) + 1, I = S[M];
        if (I && (!(p === "alignment" ? L !== ne(I) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        N.every((A) => ne(A.placement) === L ? A.overflows[0] > 0 : !0)))
          return {
            data: {
              index: M,
              overflows: N
            },
            reset: {
              placement: I
            }
          };
        let D = (O = N.filter(($) => $.overflows[0] <= 0).sort(($, A) => $.overflows[1] - A.overflows[1])[0]) == null ? void 0 : O.placement;
        if (!D)
          switch (g) {
            case "bestFit": {
              var T;
              const $ = (T = N.filter((A) => {
                if (k) {
                  const j = ne(A.placement);
                  return j === L || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  j === "y";
                }
                return !0;
              }).map((A) => [A.placement, A.overflows.filter((j) => j > 0).reduce((j, K) => j + K, 0)]).sort((A, j) => A[1] - j[1])[0]) == null ? void 0 : T[0];
              $ && (D = $);
              break;
            }
            case "initialPlacement":
              D = l;
              break;
          }
        if (o !== D)
          return {
            reset: {
              placement: D
            }
          };
      }
      return {};
    }
  };
};
function Tn(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function On(e) {
  return bs.some((t) => e[t] >= 0);
}
const Fs = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n,
        platform: r
      } = t, {
        strategy: o = "referenceHidden",
        ...i
      } = ie(e, t);
      switch (o) {
        case "referenceHidden": {
          const s = await r.detectOverflow(t, {
            ...i,
            elementContext: "reference"
          }), l = Tn(s, n.reference);
          return {
            data: {
              referenceHiddenOffsets: l,
              referenceHidden: On(l)
            }
          };
        }
        case "escaped": {
          const s = await r.detectOverflow(t, {
            ...i,
            altBoundary: !0
          }), l = Tn(s, n.floating);
          return {
            data: {
              escapedOffsets: l,
              escaped: On(l)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, Vr = /* @__PURE__ */ new Set(["left", "top"]);
async function Ps(e, t) {
  const {
    placement: n,
    platform: r,
    elements: o
  } = e, i = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)), s = se(n), l = Ee(n), c = ne(n) === "y", f = Vr.has(s) ? -1 : 1, d = i && c ? -1 : 1, p = ie(t, e);
  let {
    mainAxis: m,
    crossAxis: g,
    alignmentAxis: v
  } = typeof p == "number" ? {
    mainAxis: p,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: p.mainAxis || 0,
    crossAxis: p.crossAxis || 0,
    alignmentAxis: p.alignmentAxis
  };
  return l && typeof v == "number" && (g = l === "end" ? v * -1 : v), c ? {
    x: g * d,
    y: m * f
  } : {
    x: m * f,
    y: g * d
  };
}
const Ts = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: o,
        y: i,
        placement: s,
        middlewareData: l
      } = t, c = await Ps(t, e);
      return s === ((n = l.offset) == null ? void 0 : n.placement) && (r = l.arrow) != null && r.alignmentOffset ? {} : {
        x: o + c.x,
        y: i + c.y,
        data: {
          ...c,
          placement: s
        }
      };
    }
  };
}, Os = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: o,
        platform: i
      } = t, {
        mainAxis: s = !0,
        crossAxis: l = !1,
        limiter: c = {
          fn: (C) => {
            let {
              x: L,
              y: _
            } = C;
            return {
              x: L,
              y: _
            };
          }
        },
        ...f
      } = ie(e, t), d = {
        x: n,
        y: r
      }, p = await i.detectOverflow(t, f), m = ne(se(o)), g = en(m);
      let v = d[g], h = d[m];
      if (s) {
        const C = g === "y" ? "top" : "left", L = g === "y" ? "bottom" : "right", _ = v + p[C], w = v - p[L];
        v = Rt(_, v, w);
      }
      if (l) {
        const C = m === "y" ? "top" : "left", L = m === "y" ? "bottom" : "right", _ = h + p[C], w = h - p[L];
        h = Rt(_, h, w);
      }
      const y = c.fn({
        ...t,
        [g]: v,
        [m]: h
      });
      return {
        ...y,
        data: {
          x: y.x - n,
          y: y.y - r,
          enabled: {
            [g]: s,
            [m]: l
          }
        }
      };
    }
  };
}, Ds = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      const {
        x: n,
        y: r,
        placement: o,
        rects: i,
        middlewareData: s
      } = t, {
        offset: l = 0,
        mainAxis: c = !0,
        crossAxis: f = !0
      } = ie(e, t), d = {
        x: n,
        y: r
      }, p = ne(o), m = en(p);
      let g = d[m], v = d[p];
      const h = ie(l, t), y = typeof h == "number" ? {
        mainAxis: h,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...h
      };
      if (c) {
        const _ = m === "y" ? "height" : "width", w = i.reference[m] - i.floating[_] + y.mainAxis, E = i.reference[m] + i.reference[_] - y.mainAxis;
        g < w ? g = w : g > E && (g = E);
      }
      if (f) {
        var C, L;
        const _ = m === "y" ? "width" : "height", w = Vr.has(se(o)), E = i.reference[p] - i.floating[_] + (w && ((C = s.offset) == null ? void 0 : C[p]) || 0) + (w ? 0 : y.crossAxis), k = i.reference[p] + i.reference[_] + (w ? 0 : ((L = s.offset) == null ? void 0 : L[p]) || 0) - (w ? y.crossAxis : 0);
        v < E ? v = E : v > k && (v = k);
      }
      return {
        [m]: g,
        [p]: v
      };
    }
  };
}, Is = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        rects: i,
        platform: s,
        elements: l
      } = t, {
        apply: c = () => {
        },
        ...f
      } = ie(e, t), d = await s.detectOverflow(t, f), p = se(o), m = Ee(o), g = ne(o) === "y", {
        width: v,
        height: h
      } = i.floating;
      let y, C;
      p === "top" || p === "bottom" ? (y = p, C = m === (await (s.isRTL == null ? void 0 : s.isRTL(l.floating)) ? "start" : "end") ? "left" : "right") : (C = p, y = m === "end" ? "top" : "bottom");
      const L = h - d.top - d.bottom, _ = v - d.left - d.right, w = de(h - d[y], L), E = de(v - d[C], _), k = !t.middlewareData.shift;
      let S = w, F = E;
      if ((n = t.middlewareData.shift) != null && n.enabled.x && (F = _), (r = t.middlewareData.shift) != null && r.enabled.y && (S = L), k && !m) {
        const N = Y(d.left, 0), P = Y(d.right, 0), O = Y(d.top, 0), T = Y(d.bottom, 0);
        g ? F = v - 2 * (N !== 0 || P !== 0 ? N + P : Y(d.left, d.right)) : S = h - 2 * (O !== 0 || T !== 0 ? O + T : Y(d.top, d.bottom));
      }
      await c({
        ...t,
        availableWidth: F,
        availableHeight: S
      });
      const R = await s.getDimensions(l.floating);
      return v !== R.width || h !== R.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function tt() {
  return typeof window < "u";
}
function ke(e) {
  return Br(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function X(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function ae(e) {
  var t;
  return (t = (Br(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Br(e) {
  return tt() ? e instanceof Node || e instanceof X(e).Node : !1;
}
function J(e) {
  return tt() ? e instanceof Element || e instanceof X(e).Element : !1;
}
function le(e) {
  return tt() ? e instanceof HTMLElement || e instanceof X(e).HTMLElement : !1;
}
function Dn(e) {
  return !tt() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof X(e).ShadowRoot;
}
function Ae(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: o
  } = ee(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && o !== "inline" && o !== "contents";
}
function Vs(e) {
  return /^(table|td|th)$/.test(ke(e));
}
function nt(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const Bs = /transform|translate|scale|rotate|perspective|filter/, $s = /paint|layout|strict|content/, pe = (e) => !!e && e !== "none";
let mt;
function rn(e) {
  const t = J(e) ? ee(e) : e;
  return pe(t.transform) || pe(t.translate) || pe(t.scale) || pe(t.rotate) || pe(t.perspective) || !an() && (pe(t.backdropFilter) || pe(t.filter)) || Bs.test(t.willChange || "") || $s.test(t.contain || "");
}
function Zs(e) {
  let t = ue(e);
  for (; le(t) && !Ne(t); ) {
    if (rn(t))
      return t;
    if (nt(t))
      return null;
    t = ue(t);
  }
  return null;
}
function an() {
  return mt == null && (mt = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), mt;
}
function Ne(e) {
  return /^(html|body|#document)$/.test(ke(e));
}
function ee(e) {
  return X(e).getComputedStyle(e);
}
function rt(e) {
  return J(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function ue(e) {
  if (ke(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Dn(e) && e.host || // Fallback.
    ae(e)
  );
  return Dn(t) ? t.host : t;
}
function $r(e) {
  const t = ue(e);
  return Ne(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : le(t) && Ae(t) ? t : $r(t);
}
function Re(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = $r(e), i = o === ((r = e.ownerDocument) == null ? void 0 : r.body), s = X(o);
  if (i) {
    const l = Ft(s);
    return t.concat(s, s.visualViewport || [], Ae(o) ? o : [], l && n ? Re(l) : []);
  } else
    return t.concat(o, Re(o, [], n));
}
function Ft(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Zr(e) {
  const t = ee(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const o = le(e), i = o ? e.offsetWidth : n, s = o ? e.offsetHeight : r, l = Ke(n) !== i || Ke(r) !== s;
  return l && (n = i, r = s), {
    width: n,
    height: r,
    $: l
  };
}
function on(e) {
  return J(e) ? e : e.contextElement;
}
function _e(e) {
  const t = on(e);
  if (!le(t))
    return re(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: o,
    $: i
  } = Zr(t);
  let s = (i ? Ke(n.width) : n.width) / r, l = (i ? Ke(n.height) : n.height) / o;
  return (!s || !Number.isFinite(s)) && (s = 1), (!l || !Number.isFinite(l)) && (l = 1), {
    x: s,
    y: l
  };
}
const Hs = /* @__PURE__ */ re(0);
function Hr(e) {
  const t = X(e);
  return !an() || !t.visualViewport ? Hs : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function js(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== X(e) ? !1 : t;
}
function me(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), i = on(e);
  let s = re(1);
  t && (r ? J(r) && (s = _e(r)) : s = _e(e));
  const l = js(i, n, r) ? Hr(i) : re(0);
  let c = (o.left + l.x) / s.x, f = (o.top + l.y) / s.y, d = o.width / s.x, p = o.height / s.y;
  if (i) {
    const m = X(i), g = r && J(r) ? X(r) : r;
    let v = m, h = Ft(v);
    for (; h && r && g !== v; ) {
      const y = _e(h), C = h.getBoundingClientRect(), L = ee(h), _ = C.left + (h.clientLeft + parseFloat(L.paddingLeft)) * y.x, w = C.top + (h.clientTop + parseFloat(L.paddingTop)) * y.y;
      c *= y.x, f *= y.y, d *= y.x, p *= y.y, c += _, f += w, v = X(h), h = Ft(v);
    }
  }
  return Ye({
    width: d,
    height: p,
    x: c,
    y: f
  });
}
function at(e, t) {
  const n = rt(e).scrollLeft;
  return t ? t.left + n : me(ae(e)).left + n;
}
function jr(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - at(e, n), o = n.top + t.scrollTop;
  return {
    x: r,
    y: o
  };
}
function Ws(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: o
  } = e;
  const i = o === "fixed", s = ae(r), l = t ? nt(t.floating) : !1;
  if (r === s || l && i)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, f = re(1);
  const d = re(0), p = le(r);
  if ((p || !p && !i) && ((ke(r) !== "body" || Ae(s)) && (c = rt(r)), p)) {
    const g = me(r);
    f = _e(r), d.x = g.x + r.clientLeft, d.y = g.y + r.clientTop;
  }
  const m = s && !p && !i ? jr(s, c) : re(0);
  return {
    width: n.width * f.x,
    height: n.height * f.y,
    x: n.x * f.x - c.scrollLeft * f.x + d.x + m.x,
    y: n.y * f.y - c.scrollTop * f.y + d.y + m.y
  };
}
function zs(e) {
  return Array.from(e.getClientRects());
}
function Us(e) {
  const t = ae(e), n = rt(e), r = e.ownerDocument.body, o = Y(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), i = Y(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + at(e);
  const l = -n.scrollTop;
  return ee(r).direction === "rtl" && (s += Y(t.clientWidth, r.clientWidth) - o), {
    width: o,
    height: i,
    x: s,
    y: l
  };
}
const In = 25;
function Ks(e, t) {
  const n = X(e), r = ae(e), o = n.visualViewport;
  let i = r.clientWidth, s = r.clientHeight, l = 0, c = 0;
  if (o) {
    i = o.width, s = o.height;
    const d = an();
    (!d || d && t === "fixed") && (l = o.offsetLeft, c = o.offsetTop);
  }
  const f = at(r);
  if (f <= 0) {
    const d = r.ownerDocument, p = d.body, m = getComputedStyle(p), g = d.compatMode === "CSS1Compat" && parseFloat(m.marginLeft) + parseFloat(m.marginRight) || 0, v = Math.abs(r.clientWidth - p.clientWidth - g);
    v <= In && (i -= v);
  } else f <= In && (i += f);
  return {
    width: i,
    height: s,
    x: l,
    y: c
  };
}
function Gs(e, t) {
  const n = me(e, !0, t === "fixed"), r = n.top + e.clientTop, o = n.left + e.clientLeft, i = le(e) ? _e(e) : re(1), s = e.clientWidth * i.x, l = e.clientHeight * i.y, c = o * i.x, f = r * i.y;
  return {
    width: s,
    height: l,
    x: c,
    y: f
  };
}
function Vn(e, t, n) {
  let r;
  if (t === "viewport")
    r = Ks(e, n);
  else if (t === "document")
    r = Us(ae(e));
  else if (J(t))
    r = Gs(t, n);
  else {
    const o = Hr(e);
    r = {
      x: t.x - o.x,
      y: t.y - o.y,
      width: t.width,
      height: t.height
    };
  }
  return Ye(r);
}
function Wr(e, t) {
  const n = ue(e);
  return n === t || !J(n) || Ne(n) ? !1 : ee(n).position === "fixed" || Wr(n, t);
}
function Ys(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = Re(e, [], !1).filter((l) => J(l) && ke(l) !== "body"), o = null;
  const i = ee(e).position === "fixed";
  let s = i ? ue(e) : e;
  for (; J(s) && !Ne(s); ) {
    const l = ee(s), c = rn(s);
    !c && l.position === "fixed" && (o = null), (i ? !c && !o : !c && l.position === "static" && !!o && (o.position === "absolute" || o.position === "fixed") || Ae(s) && !c && Wr(e, s)) ? r = r.filter((d) => d !== s) : o = l, s = ue(s);
  }
  return t.set(e, r), r;
}
function Xs(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: o
  } = e;
  const s = [...n === "clippingAncestors" ? nt(t) ? [] : Ys(t, this._c) : [].concat(n), r], l = Vn(t, s[0], o);
  let c = l.top, f = l.right, d = l.bottom, p = l.left;
  for (let m = 1; m < s.length; m++) {
    const g = Vn(t, s[m], o);
    c = Y(g.top, c), f = de(g.right, f), d = de(g.bottom, d), p = Y(g.left, p);
  }
  return {
    width: f - p,
    height: d - c,
    x: p,
    y: c
  };
}
function qs(e) {
  const {
    width: t,
    height: n
  } = Zr(e);
  return {
    width: t,
    height: n
  };
}
function Qs(e, t, n) {
  const r = le(t), o = ae(t), i = n === "fixed", s = me(e, !0, i, t);
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = re(0);
  function f() {
    c.x = at(o);
  }
  if (r || !r && !i)
    if ((ke(t) !== "body" || Ae(o)) && (l = rt(t)), r) {
      const g = me(t, !0, i, t);
      c.x = g.x + t.clientLeft, c.y = g.y + t.clientTop;
    } else o && f();
  i && !r && o && f();
  const d = o && !r && !i ? jr(o, l) : re(0), p = s.left + l.scrollLeft - c.x - d.x, m = s.top + l.scrollTop - c.y - d.y;
  return {
    x: p,
    y: m,
    width: s.width,
    height: s.height
  };
}
function ht(e) {
  return ee(e).position === "static";
}
function Bn(e, t) {
  if (!le(e) || ee(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return ae(e) === n && (n = n.ownerDocument.body), n;
}
function zr(e, t) {
  const n = X(e);
  if (nt(e))
    return n;
  if (!le(e)) {
    let o = ue(e);
    for (; o && !Ne(o); ) {
      if (J(o) && !ht(o))
        return o;
      o = ue(o);
    }
    return n;
  }
  let r = Bn(e, t);
  for (; r && Vs(r) && ht(r); )
    r = Bn(r, t);
  return r && Ne(r) && ht(r) && !rn(r) ? n : r || Zs(e) || n;
}
const Js = async function(e) {
  const t = this.getOffsetParent || zr, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: Qs(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function el(e) {
  return ee(e).direction === "rtl";
}
const tl = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Ws,
  getDocumentElement: ae,
  getClippingRect: Xs,
  getOffsetParent: zr,
  getElementRects: Js,
  getClientRects: zs,
  getDimensions: qs,
  getScale: _e,
  isElement: J,
  isRTL: el
};
function Ur(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function nl(e, t) {
  let n = null, r;
  const o = ae(e);
  function i() {
    var l;
    clearTimeout(r), (l = n) == null || l.disconnect(), n = null;
  }
  function s(l, c) {
    l === void 0 && (l = !1), c === void 0 && (c = 1), i();
    const f = e.getBoundingClientRect(), {
      left: d,
      top: p,
      width: m,
      height: g
    } = f;
    if (l || t(), !m || !g)
      return;
    const v = Oe(p), h = Oe(o.clientWidth - (d + m)), y = Oe(o.clientHeight - (p + g)), C = Oe(d), _ = {
      rootMargin: -v + "px " + -h + "px " + -y + "px " + -C + "px",
      threshold: Y(0, de(1, c)) || 1
    };
    let w = !0;
    function E(k) {
      const S = k[0].intersectionRatio;
      if (S !== c) {
        if (!w)
          return s();
        S ? s(!1, S) : r = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      S === 1 && !Ur(f, e.getBoundingClientRect()) && s(), w = !1;
    }
    try {
      n = new IntersectionObserver(E, {
        ..._,
        // Handle <iframe>s
        root: o.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(E, _);
    }
    n.observe(e);
  }
  return s(!0), i;
}
function rl(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: o = !0,
    ancestorResize: i = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: l = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = r, f = on(e), d = o || i ? [...f ? Re(f) : [], ...t ? Re(t) : []] : [];
  d.forEach((C) => {
    o && C.addEventListener("scroll", n, {
      passive: !0
    }), i && C.addEventListener("resize", n);
  });
  const p = f && l ? nl(f, n) : null;
  let m = -1, g = null;
  s && (g = new ResizeObserver((C) => {
    let [L] = C;
    L && L.target === f && g && t && (g.unobserve(t), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var _;
      (_ = g) == null || _.observe(t);
    })), n();
  }), f && !c && g.observe(f), t && g.observe(t));
  let v, h = c ? me(e) : null;
  c && y();
  function y() {
    const C = me(e);
    h && !Ur(h, C) && n(), h = C, v = requestAnimationFrame(y);
  }
  return n(), () => {
    var C;
    d.forEach((L) => {
      o && L.removeEventListener("scroll", n), i && L.removeEventListener("resize", n);
    }), p?.(), (C = g) == null || C.disconnect(), g = null, c && cancelAnimationFrame(v);
  };
}
const al = Ts, ol = Os, il = As, sl = Is, ll = Fs, $n = Rs, cl = Ds, dl = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), o = {
    platform: tl,
    ...n
  }, i = {
    ...o.platform,
    _c: r
  };
  return Ms(e, t, {
    ...o,
    platform: i
  });
};
var ul = typeof document < "u", fl = function() {
}, Ze = ul ? Ia : fl;
function Xe(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0; )
        if (!Xe(e[r], t[r]))
          return !1;
      return !0;
    }
    if (o = Object.keys(e), n = o.length, n !== Object.keys(t).length)
      return !1;
    for (r = n; r-- !== 0; )
      if (!{}.hasOwnProperty.call(t, o[r]))
        return !1;
    for (r = n; r-- !== 0; ) {
      const i = o[r];
      if (!(i === "_owner" && e.$$typeof) && !Xe(e[i], t[i]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Kr(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Zn(e, t) {
  const n = Kr(e);
  return Math.round(t * n) / n;
}
function gt(e) {
  const t = u.useRef(e);
  return Ze(() => {
    t.current = e;
  }), t;
}
function pl(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: o,
    elements: {
      reference: i,
      floating: s
    } = {},
    transform: l = !0,
    whileElementsMounted: c,
    open: f
  } = e, [d, p] = u.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [m, g] = u.useState(r);
  Xe(m, r) || g(r);
  const [v, h] = u.useState(null), [y, C] = u.useState(null), L = u.useCallback((A) => {
    A !== k.current && (k.current = A, h(A));
  }, []), _ = u.useCallback((A) => {
    A !== S.current && (S.current = A, C(A));
  }, []), w = i || v, E = s || y, k = u.useRef(null), S = u.useRef(null), F = u.useRef(d), R = c != null, N = gt(c), P = gt(o), O = gt(f), T = u.useCallback(() => {
    if (!k.current || !S.current)
      return;
    const A = {
      placement: t,
      strategy: n,
      middleware: m
    };
    P.current && (A.platform = P.current), dl(k.current, S.current, A).then((j) => {
      const K = {
        ...j,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: O.current !== !1
      };
      M.current && !Xe(F.current, K) && (F.current = K, Kn.flushSync(() => {
        p(K);
      }));
    });
  }, [m, t, n, P, O]);
  Ze(() => {
    f === !1 && F.current.isPositioned && (F.current.isPositioned = !1, p((A) => ({
      ...A,
      isPositioned: !1
    })));
  }, [f]);
  const M = u.useRef(!1);
  Ze(() => (M.current = !0, () => {
    M.current = !1;
  }), []), Ze(() => {
    if (w && (k.current = w), E && (S.current = E), w && E) {
      if (N.current)
        return N.current(w, E, T);
      T();
    }
  }, [w, E, T, N, R]);
  const I = u.useMemo(() => ({
    reference: k,
    floating: S,
    setReference: L,
    setFloating: _
  }), [L, _]), D = u.useMemo(() => ({
    reference: w,
    floating: E
  }), [w, E]), $ = u.useMemo(() => {
    const A = {
      position: n,
      left: 0,
      top: 0
    };
    if (!D.floating)
      return A;
    const j = Zn(D.floating, d.x), K = Zn(D.floating, d.y);
    return l ? {
      ...A,
      transform: "translate(" + j + "px, " + K + "px)",
      ...Kr(D.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: j,
      top: K
    };
  }, [n, l, D.floating, d.x, d.y]);
  return u.useMemo(() => ({
    ...d,
    update: T,
    refs: I,
    elements: D,
    floatingStyles: $
  }), [d, T, I, D, $]);
}
const ml = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: r,
        padding: o
      } = typeof e == "function" ? e(n) : e;
      return r && t(r) ? r.current != null ? $n({
        element: r.current,
        padding: o
      }).fn(n) : {} : r ? $n({
        element: r,
        padding: o
      }).fn(n) : {};
    }
  };
}, hl = (e, t) => {
  const n = al(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, gl = (e, t) => {
  const n = ol(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, vl = (e, t) => ({
  fn: cl(e).fn,
  options: [e, t]
}), bl = (e, t) => {
  const n = il(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, yl = (e, t) => {
  const n = sl(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Cl = (e, t) => {
  const n = ll(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, _l = (e, t) => {
  const n = ml(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
};
var wl = "Arrow", Gr = u.forwardRef((e, t) => {
  const { children: n, width: r = 10, height: o = 5, ...i } = e;
  return /* @__PURE__ */ a(
    H.svg,
    {
      ...i,
      ref: t,
      width: r,
      height: o,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ a("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Gr.displayName = wl;
var xl = Gr;
function Nl(e) {
  const [t, n] = u.useState(void 0);
  return Q(() => {
    if (e) {
      n({ width: e.offsetWidth, height: e.offsetHeight });
      const r = new ResizeObserver((o) => {
        if (!Array.isArray(o) || !o.length)
          return;
        const i = o[0];
        let s, l;
        if ("borderBoxSize" in i) {
          const c = i.borderBoxSize, f = Array.isArray(c) ? c[0] : c;
          s = f.inlineSize, l = f.blockSize;
        } else
          s = e.offsetWidth, l = e.offsetHeight;
        n({ width: s, height: l });
      });
      return r.observe(e, { box: "border-box" }), () => r.unobserve(e);
    } else
      n(void 0);
  }, [e]), t;
}
var sn = "Popper", [Yr, Xr] = Je(sn), [Ll, qr] = Yr(sn), Qr = (e) => {
  const { __scopePopper: t, children: n } = e, [r, o] = u.useState(null);
  return /* @__PURE__ */ a(Ll, { scope: t, anchor: r, onAnchorChange: o, children: n });
};
Qr.displayName = sn;
var Jr = "PopperAnchor", ea = u.forwardRef(
  (e, t) => {
    const { __scopePopper: n, virtualRef: r, ...o } = e, i = qr(Jr, n), s = u.useRef(null), l = U(t, s), c = u.useRef(null);
    return u.useEffect(() => {
      const f = c.current;
      c.current = r?.current || s.current, f !== c.current && i.onAnchorChange(c.current);
    }), r ? null : /* @__PURE__ */ a(H.div, { ...o, ref: l });
  }
);
ea.displayName = Jr;
var ln = "PopperContent", [El, kl] = Yr(ln), ta = u.forwardRef(
  (e, t) => {
    const {
      __scopePopper: n,
      side: r = "bottom",
      sideOffset: o = 0,
      align: i = "center",
      alignOffset: s = 0,
      arrowPadding: l = 0,
      avoidCollisions: c = !0,
      collisionBoundary: f = [],
      collisionPadding: d = 0,
      sticky: p = "partial",
      hideWhenDetached: m = !1,
      updatePositionStrategy: g = "optimized",
      onPlaced: v,
      ...h
    } = e, y = qr(ln, n), [C, L] = u.useState(null), _ = U(t, (Se) => L(Se)), [w, E] = u.useState(null), k = Nl(w), S = k?.width ?? 0, F = k?.height ?? 0, R = r + (i !== "center" ? "-" + i : ""), N = typeof d == "number" ? d : { top: 0, right: 0, bottom: 0, left: 0, ...d }, P = Array.isArray(f) ? f : [f], O = P.length > 0, T = {
      padding: N,
      boundary: P.filter(Ml),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: O
    }, { refs: M, floatingStyles: I, placement: D, isPositioned: $, middlewareData: A } = pl({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: R,
      whileElementsMounted: (...Se) => rl(...Se, {
        animationFrame: g === "always"
      }),
      elements: {
        reference: y.anchor
      },
      middleware: [
        hl({ mainAxis: o + F, alignmentAxis: s }),
        c && gl({
          mainAxis: !0,
          crossAxis: !1,
          limiter: p === "partial" ? vl() : void 0,
          ...T
        }),
        c && bl({ ...T }),
        yl({
          ...T,
          apply: ({ elements: Se, rects: un, availableWidth: Fa, availableHeight: Pa }) => {
            const { width: Ta, height: Oa } = un.reference, Pe = Se.floating.style;
            Pe.setProperty("--radix-popper-available-width", `${Fa}px`), Pe.setProperty("--radix-popper-available-height", `${Pa}px`), Pe.setProperty("--radix-popper-anchor-width", `${Ta}px`), Pe.setProperty("--radix-popper-anchor-height", `${Oa}px`);
          }
        }),
        w && _l({ element: w, padding: l }),
        Rl({ arrowWidth: S, arrowHeight: F }),
        m && Cl({ strategy: "referenceHidden", ...T })
      ]
    }), [j, K] = aa(D), dn = G(v);
    Q(() => {
      $ && dn?.();
    }, [$, dn]);
    const ka = A.arrow?.x, Sa = A.arrow?.y, Ma = A.arrow?.centerOffset !== 0, [Ra, Aa] = u.useState();
    return Q(() => {
      C && Aa(window.getComputedStyle(C).zIndex);
    }, [C]), /* @__PURE__ */ a(
      "div",
      {
        ref: M.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...I,
          transform: $ ? I.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: Ra,
          "--radix-popper-transform-origin": [
            A.transformOrigin?.x,
            A.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...A.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ a(
          El,
          {
            scope: n,
            placedSide: j,
            onArrowChange: E,
            arrowX: ka,
            arrowY: Sa,
            shouldHideArrow: Ma,
            children: /* @__PURE__ */ a(
              H.div,
              {
                "data-side": j,
                "data-align": K,
                ...h,
                ref: _,
                style: {
                  ...h.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: $ ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
ta.displayName = ln;
var na = "PopperArrow", Sl = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, ra = u.forwardRef(function(t, n) {
  const { __scopePopper: r, ...o } = t, i = kl(na, r), s = Sl[i.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ a(
      "span",
      {
        ref: i.onArrowChange,
        style: {
          position: "absolute",
          left: i.arrowX,
          top: i.arrowY,
          [s]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[i.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[i.placedSide],
          visibility: i.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ a(
          xl,
          {
            ...o,
            ref: n,
            style: {
              ...o.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
ra.displayName = na;
function Ml(e) {
  return e !== null;
}
var Rl = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    const { placement: n, rects: r, middlewareData: o } = t, s = o.arrow?.centerOffset !== 0, l = s ? 0 : e.arrowWidth, c = s ? 0 : e.arrowHeight, [f, d] = aa(n), p = { start: "0%", center: "50%", end: "100%" }[d], m = (o.arrow?.x ?? 0) + l / 2, g = (o.arrow?.y ?? 0) + c / 2;
    let v = "", h = "";
    return f === "bottom" ? (v = s ? p : `${m}px`, h = `${-c}px`) : f === "top" ? (v = s ? p : `${m}px`, h = `${r.floating.height + c}px`) : f === "right" ? (v = `${-c}px`, h = s ? p : `${g}px`) : f === "left" && (v = `${r.floating.width + c}px`, h = s ? p : `${g}px`), { data: { x: v, y: h } };
  }
});
function aa(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var Al = Qr, oa = ea, Fl = ta, Pl = ra, Tl = "Portal", ia = u.forwardRef((e, t) => {
  const { container: n, ...r } = e, [o, i] = u.useState(!1);
  Q(() => i(!0), []);
  const s = n || o && globalThis?.document?.body;
  return s ? Gn.createPortal(/* @__PURE__ */ a(H.div, { ...r, ref: t }), s) : null;
});
ia.displayName = Tl;
var Ol = function(e) {
  if (typeof document > "u")
    return null;
  var t = Array.isArray(e) ? e[0] : e;
  return t.ownerDocument.body;
}, be = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Ie = {}, vt = 0, sa = function(e) {
  return e && (e.host || sa(e.parentNode));
}, Dl = function(e, t) {
  return t.map(function(n) {
    if (e.contains(n))
      return n;
    var r = sa(n);
    return r && e.contains(r) ? r : (console.error("aria-hidden", n, "in not contained inside", e, ". Doing nothing"), null);
  }).filter(function(n) {
    return !!n;
  });
}, Il = function(e, t, n, r) {
  var o = Dl(t, Array.isArray(e) ? e : [e]);
  Ie[n] || (Ie[n] = /* @__PURE__ */ new WeakMap());
  var i = Ie[n], s = [], l = /* @__PURE__ */ new Set(), c = new Set(o), f = function(p) {
    !p || l.has(p) || (l.add(p), f(p.parentNode));
  };
  o.forEach(f);
  var d = function(p) {
    !p || c.has(p) || Array.prototype.forEach.call(p.children, function(m) {
      if (l.has(m))
        d(m);
      else
        try {
          var g = m.getAttribute(r), v = g !== null && g !== "false", h = (be.get(m) || 0) + 1, y = (i.get(m) || 0) + 1;
          be.set(m, h), i.set(m, y), s.push(m), h === 1 && v && De.set(m, !0), y === 1 && m.setAttribute(n, "true"), v || m.setAttribute(r, "true");
        } catch (C) {
          console.error("aria-hidden: cannot operate on ", m, C);
        }
    });
  };
  return d(t), l.clear(), vt++, function() {
    s.forEach(function(p) {
      var m = be.get(p) - 1, g = i.get(p) - 1;
      be.set(p, m), i.set(p, g), m || (De.has(p) || p.removeAttribute(r), De.delete(p)), g || p.removeAttribute(n);
    }), vt--, vt || (be = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakMap(), Ie = {});
  };
}, Vl = function(e, t, n) {
  n === void 0 && (n = "data-aria-hidden");
  var r = Array.from(Array.isArray(e) ? e : [e]), o = Ol(e);
  return o ? (r.push.apply(r, Array.from(o.querySelectorAll("[aria-live], script"))), Il(r, o, n, "aria-hidden")) : function() {
    return null;
  };
}, te = function() {
  return te = Object.assign || function(t) {
    for (var n, r = 1, o = arguments.length; r < o; r++) {
      n = arguments[r];
      for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i]);
    }
    return t;
  }, te.apply(this, arguments);
};
function la(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++)
      t.indexOf(r[o]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[o]) && (n[r[o]] = e[r[o]]);
  return n;
}
function Bl(e, t, n) {
  if (n || arguments.length === 2) for (var r = 0, o = t.length, i; r < o; r++)
    (i || !(r in t)) && (i || (i = Array.prototype.slice.call(t, 0, r)), i[r] = t[r]);
  return e.concat(i || Array.prototype.slice.call(t));
}
var He = "right-scroll-bar-position", je = "width-before-scroll-bar", $l = "with-scroll-bars-hidden", Zl = "--removed-body-scroll-bar-size";
function bt(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function Hl(e, t) {
  var n = _t(function() {
    return {
      // value
      value: e,
      // last callback
      callback: t,
      // "memoized" public interface
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var o = n.value;
          o !== r && (n.value = r, n.callback(r, o));
        }
      }
    };
  })[0];
  return n.callback = t, n.facade;
}
var jl = typeof window < "u" ? u.useLayoutEffect : u.useEffect, Hn = /* @__PURE__ */ new WeakMap();
function Wl(e, t) {
  var n = Hl(null, function(r) {
    return e.forEach(function(o) {
      return bt(o, r);
    });
  });
  return jl(function() {
    var r = Hn.get(n);
    if (r) {
      var o = new Set(r), i = new Set(e), s = n.current;
      o.forEach(function(l) {
        i.has(l) || bt(l, null);
      }), i.forEach(function(l) {
        o.has(l) || bt(l, s);
      });
    }
    Hn.set(n, e);
  }, [e]), n;
}
function zl(e) {
  return e;
}
function Ul(e, t) {
  t === void 0 && (t = zl);
  var n = [], r = !1, o = {
    read: function() {
      if (r)
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      return n.length ? n[n.length - 1] : e;
    },
    useMedium: function(i) {
      var s = t(i, r);
      return n.push(s), function() {
        n = n.filter(function(l) {
          return l !== s;
        });
      };
    },
    assignSyncMedium: function(i) {
      for (r = !0; n.length; ) {
        var s = n;
        n = [], s.forEach(i);
      }
      n = {
        push: function(l) {
          return i(l);
        },
        filter: function() {
          return n;
        }
      };
    },
    assignMedium: function(i) {
      r = !0;
      var s = [];
      if (n.length) {
        var l = n;
        n = [], l.forEach(i), s = n;
      }
      var c = function() {
        var d = s;
        s = [], d.forEach(i);
      }, f = function() {
        return Promise.resolve().then(c);
      };
      f(), n = {
        push: function(d) {
          s.push(d), f();
        },
        filter: function(d) {
          return s = s.filter(d), n;
        }
      };
    }
  };
  return o;
}
function Kl(e) {
  e === void 0 && (e = {});
  var t = Ul(null);
  return t.options = te({ async: !0, ssr: !1 }, e), t;
}
var ca = function(e) {
  var t = e.sideCar, n = la(e, ["sideCar"]);
  if (!t)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r)
    throw new Error("Sidecar medium not found");
  return u.createElement(r, te({}, n));
};
ca.isSideCarExport = !0;
function Gl(e, t) {
  return e.useMedium(t), ca;
}
var da = Kl(), yt = function() {
}, ot = u.forwardRef(function(e, t) {
  var n = u.useRef(null), r = u.useState({
    onScrollCapture: yt,
    onWheelCapture: yt,
    onTouchMoveCapture: yt
  }), o = r[0], i = r[1], s = e.forwardProps, l = e.children, c = e.className, f = e.removeScrollBar, d = e.enabled, p = e.shards, m = e.sideCar, g = e.noRelative, v = e.noIsolation, h = e.inert, y = e.allowPinchZoom, C = e.as, L = C === void 0 ? "div" : C, _ = e.gapMode, w = la(e, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), E = m, k = Wl([n, t]), S = te(te({}, w), o);
  return u.createElement(
    u.Fragment,
    null,
    d && u.createElement(E, { sideCar: da, removeScrollBar: f, shards: p, noRelative: g, noIsolation: v, inert: h, setCallbacks: i, allowPinchZoom: !!y, lockRef: n, gapMode: _ }),
    s ? u.cloneElement(u.Children.only(l), te(te({}, S), { ref: k })) : u.createElement(L, te({}, S, { className: c, ref: k }), l)
  );
});
ot.defaultProps = {
  enabled: !0,
  removeScrollBar: !0,
  inert: !1
};
ot.classNames = {
  fullWidth: je,
  zeroRight: He
};
var Yl = function() {
  if (typeof __webpack_nonce__ < "u")
    return __webpack_nonce__;
};
function Xl() {
  if (!document)
    return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = Yl();
  return t && e.setAttribute("nonce", t), e;
}
function ql(e, t) {
  e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Ql(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Jl = function() {
  var e = 0, t = null;
  return {
    add: function(n) {
      e == 0 && (t = Xl()) && (ql(t, n), Ql(t)), e++;
    },
    remove: function() {
      e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
    }
  };
}, ec = function() {
  var e = Jl();
  return function(t, n) {
    u.useEffect(function() {
      return e.add(t), function() {
        e.remove();
      };
    }, [t && n]);
  };
}, ua = function() {
  var e = ec(), t = function(n) {
    var r = n.styles, o = n.dynamic;
    return e(r, o), null;
  };
  return t;
}, tc = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
}, Ct = function(e) {
  return parseInt(e || "", 10) || 0;
}, nc = function(e) {
  var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], o = t[e === "padding" ? "paddingRight" : "marginRight"];
  return [Ct(n), Ct(r), Ct(o)];
}, rc = function(e) {
  if (e === void 0 && (e = "margin"), typeof window > "u")
    return tc;
  var t = nc(e), n = document.documentElement.clientWidth, r = window.innerWidth;
  return {
    left: t[0],
    top: t[1],
    right: t[2],
    gap: Math.max(0, r - n + t[2] - t[0])
  };
}, ac = ua(), we = "data-scroll-locked", oc = function(e, t, n, r) {
  var o = e.left, i = e.top, s = e.right, l = e.gap;
  return n === void 0 && (n = "margin"), `
  .`.concat($l, ` {
   overflow: hidden `).concat(r, `;
   padding-right: `).concat(l, "px ").concat(r, `;
  }
  body[`).concat(we, `] {
    overflow: hidden `).concat(r, `;
    overscroll-behavior: contain;
    `).concat([
    t && "position: relative ".concat(r, ";"),
    n === "margin" && `
    padding-left: `.concat(o, `px;
    padding-top: `).concat(i, `px;
    padding-right: `).concat(s, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(l, "px ").concat(r, `;
    `),
    n === "padding" && "padding-right: ".concat(l, "px ").concat(r, ";")
  ].filter(Boolean).join(""), `
  }
  
  .`).concat(He, ` {
    right: `).concat(l, "px ").concat(r, `;
  }
  
  .`).concat(je, ` {
    margin-right: `).concat(l, "px ").concat(r, `;
  }
  
  .`).concat(He, " .").concat(He, ` {
    right: 0 `).concat(r, `;
  }
  
  .`).concat(je, " .").concat(je, ` {
    margin-right: 0 `).concat(r, `;
  }
  
  body[`).concat(we, `] {
    `).concat(Zl, ": ").concat(l, `px;
  }
`);
}, jn = function() {
  var e = parseInt(document.body.getAttribute(we) || "0", 10);
  return isFinite(e) ? e : 0;
}, ic = function() {
  u.useEffect(function() {
    return document.body.setAttribute(we, (jn() + 1).toString()), function() {
      var e = jn() - 1;
      e <= 0 ? document.body.removeAttribute(we) : document.body.setAttribute(we, e.toString());
    };
  }, []);
}, sc = function(e) {
  var t = e.noRelative, n = e.noImportant, r = e.gapMode, o = r === void 0 ? "margin" : r;
  ic();
  var i = u.useMemo(function() {
    return rc(o);
  }, [o]);
  return u.createElement(ac, { styles: oc(i, !t, o, n ? "" : "!important") });
}, Pt = !1;
if (typeof window < "u")
  try {
    var Ve = Object.defineProperty({}, "passive", {
      get: function() {
        return Pt = !0, !0;
      }
    });
    window.addEventListener("test", Ve, Ve), window.removeEventListener("test", Ve, Ve);
  } catch {
    Pt = !1;
  }
var ye = Pt ? { passive: !1 } : !1, lc = function(e) {
  return e.tagName === "TEXTAREA";
}, fa = function(e, t) {
  if (!(e instanceof Element))
    return !1;
  var n = window.getComputedStyle(e);
  return (
    // not-not-scrollable
    n[t] !== "hidden" && // contains scroll inside self
    !(n.overflowY === n.overflowX && !lc(e) && n[t] === "visible")
  );
}, cc = function(e) {
  return fa(e, "overflowY");
}, dc = function(e) {
  return fa(e, "overflowX");
}, Wn = function(e, t) {
  var n = t.ownerDocument, r = t;
  do {
    typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
    var o = pa(e, r);
    if (o) {
      var i = ma(e, r), s = i[1], l = i[2];
      if (s > l)
        return !0;
    }
    r = r.parentNode;
  } while (r && r !== n.body);
  return !1;
}, uc = function(e) {
  var t = e.scrollTop, n = e.scrollHeight, r = e.clientHeight;
  return [
    t,
    n,
    r
  ];
}, fc = function(e) {
  var t = e.scrollLeft, n = e.scrollWidth, r = e.clientWidth;
  return [
    t,
    n,
    r
  ];
}, pa = function(e, t) {
  return e === "v" ? cc(t) : dc(t);
}, ma = function(e, t) {
  return e === "v" ? uc(t) : fc(t);
}, pc = function(e, t) {
  return e === "h" && t === "rtl" ? -1 : 1;
}, mc = function(e, t, n, r, o) {
  var i = pc(e, window.getComputedStyle(t).direction), s = i * r, l = n.target, c = t.contains(l), f = !1, d = s > 0, p = 0, m = 0;
  do {
    if (!l)
      break;
    var g = ma(e, l), v = g[0], h = g[1], y = g[2], C = h - y - i * v;
    (v || C) && pa(e, l) && (p += C, m += v);
    var L = l.parentNode;
    l = L && L.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? L.host : L;
  } while (
    // portaled content
    !c && l !== document.body || // self content
    c && (t.contains(l) || t === l)
  );
  return (d && Math.abs(p) < 1 || !d && Math.abs(m) < 1) && (f = !0), f;
}, Be = function(e) {
  return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, zn = function(e) {
  return [e.deltaX, e.deltaY];
}, Un = function(e) {
  return e && "current" in e ? e.current : e;
}, hc = function(e, t) {
  return e[0] === t[0] && e[1] === t[1];
}, gc = function(e) {
  return `
  .block-interactivity-`.concat(e, ` {pointer-events: none;}
  .allow-interactivity-`).concat(e, ` {pointer-events: all;}
`);
}, vc = 0, Ce = [];
function bc(e) {
  var t = u.useRef([]), n = u.useRef([0, 0]), r = u.useRef(), o = u.useState(vc++)[0], i = u.useState(ua)[0], s = u.useRef(e);
  u.useEffect(function() {
    s.current = e;
  }, [e]), u.useEffect(function() {
    if (e.inert) {
      document.body.classList.add("block-interactivity-".concat(o));
      var h = Bl([e.lockRef.current], (e.shards || []).map(Un), !0).filter(Boolean);
      return h.forEach(function(y) {
        return y.classList.add("allow-interactivity-".concat(o));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(o)), h.forEach(function(y) {
          return y.classList.remove("allow-interactivity-".concat(o));
        });
      };
    }
  }, [e.inert, e.lockRef.current, e.shards]);
  var l = u.useCallback(function(h, y) {
    if ("touches" in h && h.touches.length === 2 || h.type === "wheel" && h.ctrlKey)
      return !s.current.allowPinchZoom;
    var C = Be(h), L = n.current, _ = "deltaX" in h ? h.deltaX : L[0] - C[0], w = "deltaY" in h ? h.deltaY : L[1] - C[1], E, k = h.target, S = Math.abs(_) > Math.abs(w) ? "h" : "v";
    if ("touches" in h && S === "h" && k.type === "range")
      return !1;
    var F = window.getSelection(), R = F && F.anchorNode, N = R ? R === k || R.contains(k) : !1;
    if (N)
      return !1;
    var P = Wn(S, k);
    if (!P)
      return !0;
    if (P ? E = S : (E = S === "v" ? "h" : "v", P = Wn(S, k)), !P)
      return !1;
    if (!r.current && "changedTouches" in h && (_ || w) && (r.current = E), !E)
      return !0;
    var O = r.current || E;
    return mc(O, y, h, O === "h" ? _ : w);
  }, []), c = u.useCallback(function(h) {
    var y = h;
    if (!(!Ce.length || Ce[Ce.length - 1] !== i)) {
      var C = "deltaY" in y ? zn(y) : Be(y), L = t.current.filter(function(E) {
        return E.name === y.type && (E.target === y.target || y.target === E.shadowParent) && hc(E.delta, C);
      })[0];
      if (L && L.should) {
        y.cancelable && y.preventDefault();
        return;
      }
      if (!L) {
        var _ = (s.current.shards || []).map(Un).filter(Boolean).filter(function(E) {
          return E.contains(y.target);
        }), w = _.length > 0 ? l(y, _[0]) : !s.current.noIsolation;
        w && y.cancelable && y.preventDefault();
      }
    }
  }, []), f = u.useCallback(function(h, y, C, L) {
    var _ = { name: h, delta: y, target: C, should: L, shadowParent: yc(C) };
    t.current.push(_), setTimeout(function() {
      t.current = t.current.filter(function(w) {
        return w !== _;
      });
    }, 1);
  }, []), d = u.useCallback(function(h) {
    n.current = Be(h), r.current = void 0;
  }, []), p = u.useCallback(function(h) {
    f(h.type, zn(h), h.target, l(h, e.lockRef.current));
  }, []), m = u.useCallback(function(h) {
    f(h.type, Be(h), h.target, l(h, e.lockRef.current));
  }, []);
  u.useEffect(function() {
    return Ce.push(i), e.setCallbacks({
      onScrollCapture: p,
      onWheelCapture: p,
      onTouchMoveCapture: m
    }), document.addEventListener("wheel", c, ye), document.addEventListener("touchmove", c, ye), document.addEventListener("touchstart", d, ye), function() {
      Ce = Ce.filter(function(h) {
        return h !== i;
      }), document.removeEventListener("wheel", c, ye), document.removeEventListener("touchmove", c, ye), document.removeEventListener("touchstart", d, ye);
    };
  }, []);
  var g = e.removeScrollBar, v = e.inert;
  return u.createElement(
    u.Fragment,
    null,
    v ? u.createElement(i, { styles: gc(o) }) : null,
    g ? u.createElement(sc, { noRelative: e.noRelative, gapMode: e.gapMode }) : null
  );
}
function yc(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
  return t;
}
const Cc = Gl(da, bc);
var ha = u.forwardRef(function(e, t) {
  return u.createElement(ot, te({}, e, { ref: t, sideCar: Cc }));
});
ha.classNames = ot.classNames;
var it = "Popover", [ga] = Je(it, [
  Xr
]), Fe = Xr(), [_c, fe] = ga(it), va = (e) => {
  const {
    __scopePopover: t,
    children: n,
    open: r,
    defaultOpen: o,
    onOpenChange: i,
    modal: s = !1
  } = e, l = Fe(t), c = u.useRef(null), [f, d] = u.useState(!1), [p, m] = Bt({
    prop: r,
    defaultProp: o ?? !1,
    onChange: i,
    caller: it
  });
  return /* @__PURE__ */ a(Al, { ...l, children: /* @__PURE__ */ a(
    _c,
    {
      scope: t,
      contentId: $t(),
      triggerRef: c,
      open: p,
      onOpenChange: m,
      onOpenToggle: u.useCallback(() => m((g) => !g), [m]),
      hasCustomAnchor: f,
      onCustomAnchorAdd: u.useCallback(() => d(!0), []),
      onCustomAnchorRemove: u.useCallback(() => d(!1), []),
      modal: s,
      children: n
    }
  ) });
};
va.displayName = it;
var ba = "PopoverAnchor", wc = u.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, o = fe(ba, n), i = Fe(n), { onCustomAnchorAdd: s, onCustomAnchorRemove: l } = o;
    return u.useEffect(() => (s(), () => l()), [s, l]), /* @__PURE__ */ a(oa, { ...i, ...r, ref: t });
  }
);
wc.displayName = ba;
var ya = "PopoverTrigger", Ca = u.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, o = fe(ya, n), i = Fe(n), s = U(t, o.triggerRef), l = /* @__PURE__ */ a(
      H.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": o.open,
        "aria-controls": o.contentId,
        "data-state": La(o.open),
        ...r,
        ref: s,
        onClick: B(e.onClick, o.onOpenToggle)
      }
    );
    return o.hasCustomAnchor ? l : /* @__PURE__ */ a(oa, { asChild: !0, ...i, children: l });
  }
);
Ca.displayName = ya;
var cn = "PopoverPortal", [xc, Nc] = ga(cn, {
  forceMount: void 0
}), _a = (e) => {
  const { __scopePopover: t, forceMount: n, children: r, container: o } = e, i = fe(cn, t);
  return /* @__PURE__ */ a(xc, { scope: t, forceMount: n, children: /* @__PURE__ */ a(he, { present: n || i.open, children: /* @__PURE__ */ a(ia, { asChild: !0, container: o, children: r }) }) });
};
_a.displayName = cn;
var Le = "PopoverContent", wa = u.forwardRef(
  (e, t) => {
    const n = Nc(Le, e.__scopePopover), { forceMount: r = n.forceMount, ...o } = e, i = fe(Le, e.__scopePopover);
    return /* @__PURE__ */ a(he, { present: r || i.open, children: i.modal ? /* @__PURE__ */ a(Ec, { ...o, ref: t }) : /* @__PURE__ */ a(kc, { ...o, ref: t }) });
  }
);
wa.displayName = Le;
var Lc = We("PopoverContent.RemoveScroll"), Ec = u.forwardRef(
  (e, t) => {
    const n = fe(Le, e.__scopePopover), r = u.useRef(null), o = U(t, r), i = u.useRef(!1);
    return u.useEffect(() => {
      const s = r.current;
      if (s) return Vl(s);
    }, []), /* @__PURE__ */ a(ha, { as: Lc, allowPinchZoom: !0, children: /* @__PURE__ */ a(
      xa,
      {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: B(e.onCloseAutoFocus, (s) => {
          s.preventDefault(), i.current || n.triggerRef.current?.focus();
        }),
        onPointerDownOutside: B(
          e.onPointerDownOutside,
          (s) => {
            const l = s.detail.originalEvent, c = l.button === 0 && l.ctrlKey === !0, f = l.button === 2 || c;
            i.current = f;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: B(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), kc = u.forwardRef(
  (e, t) => {
    const n = fe(Le, e.__scopePopover), r = u.useRef(!1), o = u.useRef(!1);
    return /* @__PURE__ */ a(
      xa,
      {
        ...e,
        ref: t,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (i) => {
          e.onCloseAutoFocus?.(i), i.defaultPrevented || (r.current || n.triggerRef.current?.focus(), i.preventDefault()), r.current = !1, o.current = !1;
        },
        onInteractOutside: (i) => {
          e.onInteractOutside?.(i), i.defaultPrevented || (r.current = !0, i.detail.originalEvent.type === "pointerdown" && (o.current = !0));
          const s = i.target;
          n.triggerRef.current?.contains(s) && i.preventDefault(), i.detail.originalEvent.type === "focusin" && o.current && i.preventDefault();
        }
      }
    );
  }
), xa = u.forwardRef(
  (e, t) => {
    const {
      __scopePopover: n,
      trapFocus: r,
      onOpenAutoFocus: o,
      onCloseAutoFocus: i,
      disableOutsidePointerEvents: s,
      onEscapeKeyDown: l,
      onPointerDownOutside: c,
      onFocusOutside: f,
      onInteractOutside: d,
      ...p
    } = e, m = fe(Le, n), g = Fe(n);
    return ds(), /* @__PURE__ */ a(
      Or,
      {
        asChild: !0,
        loop: !0,
        trapped: r,
        onMountAutoFocus: o,
        onUnmountAutoFocus: i,
        children: /* @__PURE__ */ a(
          Zt,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: d,
            onEscapeKeyDown: l,
            onPointerDownOutside: c,
            onFocusOutside: f,
            onDismiss: () => m.onOpenChange(!1),
            children: /* @__PURE__ */ a(
              Fl,
              {
                "data-state": La(m.open),
                role: "dialog",
                id: m.contentId,
                ...g,
                ...p,
                ref: t,
                style: {
                  ...p.style,
                  "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                  "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                  "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                  "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                  "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                }
              }
            )
          }
        )
      }
    );
  }
), Na = "PopoverClose", Sc = u.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, o = fe(Na, n);
    return /* @__PURE__ */ a(
      H.button,
      {
        type: "button",
        ...r,
        ref: t,
        onClick: B(e.onClick, () => o.onOpenChange(!1))
      }
    );
  }
);
Sc.displayName = Na;
var Mc = "PopoverArrow", Rc = u.forwardRef(
  (e, t) => {
    const { __scopePopover: n, ...r } = e, o = Fe(n);
    return /* @__PURE__ */ a(Pl, { ...o, ...r, ref: t });
  }
);
Rc.displayName = Mc;
function La(e) {
  return e ? "open" : "closed";
}
var Ac = va, Fc = Ca, Pc = _a, Tc = wa;
const Oc = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], Tt = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
function Dc(e, t) {
  if (!e) return "";
  const n = `${Tt[e.getMonth()].slice(0, 3)} ${e.getDate()}, ${e.getFullYear()}`;
  if (!t) return n;
  const r = e.getHours(), o = e.getMinutes(), i = r >= 12 ? "PM" : "AM", s = r % 12 || 12;
  return `${n} ${s}:${String(o).padStart(2, "0")} ${i}`;
}
function Ea(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate();
}
function Ic(e) {
  return Ea(e, /* @__PURE__ */ new Date());
}
function su({
  value: e,
  onChange: t,
  showTime: n = !1,
  size: r = "medium",
  placeholder: o = "Select date",
  disabled: i = !1,
  minDate: s,
  maxDate: l,
  className: c,
  id: f
}) {
  const [d, p] = u.useState(!1), [m, g] = u.useState(
    () => e ? e.getFullYear() : (/* @__PURE__ */ new Date()).getFullYear()
  ), [v, h] = u.useState(
    () => e ? e.getMonth() : (/* @__PURE__ */ new Date()).getMonth()
  ), [y, C] = u.useState(
    () => e && e.getHours() % 12 || 12
  ), [L, _] = u.useState(
    () => e ? e.getMinutes() : 0
  ), [w, E] = u.useState(
    () => e && e.getHours() >= 12 ? "PM" : "AM"
  );
  u.useEffect(() => {
    e && (g(e.getFullYear()), h(e.getMonth()), C(e.getHours() % 12 || 12), _(e.getMinutes()), E(e.getHours() >= 12 ? "PM" : "AM"));
  }, [e]);
  const k = new Date(m, v + 1, 0).getDate(), S = new Date(m, v, 1).getDay();
  function F(M) {
    const I = w === "PM" ? y === 12 ? 12 : y + 12 : y === 12 ? 0 : y, D = new Date(m, v, M, I, L, 0, 0);
    t?.(D), n || p(!1);
  }
  function R() {
    v === 0 ? (g((M) => M - 1), h(11)) : h((M) => M - 1);
  }
  function N() {
    v === 11 ? (g((M) => M + 1), h(0)) : h((M) => M + 1);
  }
  function P(M) {
    const I = new Date(m, v, M);
    return !!(s && I < s || l && I > l);
  }
  const O = Array.from({ length: 12 }, (M, I) => I + 1), T = Array.from({ length: 12 }, (M, I) => I * 5);
  return /* @__PURE__ */ b(Ac, { open: d, onOpenChange: i ? void 0 : p, children: [
    /* @__PURE__ */ a(Fc, { asChild: !0, children: /* @__PURE__ */ b(
      "button",
      {
        id: f,
        type: "button",
        disabled: i,
        "aria-haspopup": "dialog",
        "aria-expanded": d,
        className: x(
          "ef-dtp__trigger",
          `ef-dtp__trigger--${r}`,
          !e && "ef-dtp__trigger--placeholder",
          c
        ),
        children: [
          /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-dtp__cal-icon", "aria-hidden": !0, children: "calendar_today" }),
          /* @__PURE__ */ a("span", { className: "ef-dtp__trigger-text", children: e ? Dc(e, n) : o }),
          e && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              className: "ef-dtp__clear",
              "aria-label": "Clear date",
              onClick: (M) => {
                M.stopPropagation(), t?.(null);
              },
              children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ a(Pc, { children: /* @__PURE__ */ b(
      Tc,
      {
        align: "start",
        sideOffset: 4,
        className: "ef-dtp__popover",
        children: [
          /* @__PURE__ */ b("div", { className: "ef-dtp__calendar", children: [
            /* @__PURE__ */ b("div", { className: "ef-dtp__nav", children: [
              /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  className: "ef-dtp__nav-btn",
                  onClick: R,
                  "aria-label": "Previous month",
                  children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "chevron_left" })
                }
              ),
              /* @__PURE__ */ b("span", { className: "ef-dtp__month-label", children: [
                Tt[v],
                " ",
                m
              ] }),
              /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  className: "ef-dtp__nav-btn",
                  onClick: N,
                  "aria-label": "Next month",
                  children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "chevron_right" })
                }
              )
            ] }),
            /* @__PURE__ */ b("div", { className: "ef-dtp__grid", children: [
              Oc.map((M) => /* @__PURE__ */ a("span", { className: "ef-dtp__day-header", children: M }, M)),
              Array.from({ length: S }, (M, I) => /* @__PURE__ */ a("span", {}, `e-${I}`)),
              Array.from({ length: k }, (M, I) => {
                const D = I + 1, $ = new Date(m, v, D), A = e ? Ea($, e) : !1, j = Ic($), K = P(D);
                return /* @__PURE__ */ a(
                  "button",
                  {
                    type: "button",
                    disabled: K,
                    "aria-pressed": A,
                    "aria-label": `${Tt[v]} ${D}, ${m}`,
                    className: x(
                      "ef-dtp__day",
                      A && "ef-dtp__day--selected",
                      j && !A && "ef-dtp__day--today",
                      K && "ef-dtp__day--disabled"
                    ),
                    onClick: () => !K && F(D),
                    children: D
                  },
                  D
                );
              })
            ] })
          ] }),
          n && /* @__PURE__ */ b("div", { className: "ef-dtp__time", children: [
            /* @__PURE__ */ a("div", { className: "ef-dtp__time-label", children: "Time" }),
            /* @__PURE__ */ b("div", { className: "ef-dtp__time-cols", children: [
              /* @__PURE__ */ a("div", { className: "ef-dtp__time-col", children: O.map((M) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  className: x("ef-dtp__time-cell", M === y && "ef-dtp__time-cell--selected"),
                  onClick: () => C(M),
                  children: String(M).padStart(2, "0")
                },
                M
              )) }),
              /* @__PURE__ */ a("span", { className: "ef-dtp__time-sep", children: ":" }),
              /* @__PURE__ */ a("div", { className: "ef-dtp__time-col", children: T.map((M) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  className: x("ef-dtp__time-cell", M === L && "ef-dtp__time-cell--selected"),
                  onClick: () => _(M),
                  children: String(M).padStart(2, "0")
                },
                M
              )) }),
              /* @__PURE__ */ a("div", { className: "ef-dtp__time-col ef-dtp__time-col--ampm", children: ["AM", "PM"].map((M) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  className: x("ef-dtp__time-cell", M === w && "ef-dtp__time-cell--selected"),
                  onClick: () => E(M),
                  children: M
                },
                M
              )) })
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
function lu({
  value: e,
  max: t,
  label: n,
  showLabel: r = !0,
  className: o
}) {
  const i = Math.max(1, t), s = Math.min(i, Math.max(0, e)), l = `${s} of ${i} steps complete`, c = n ?? l;
  return /* @__PURE__ */ b(
    "div",
    {
      role: "progressbar",
      "aria-valuenow": s,
      "aria-valuemin": 0,
      "aria-valuemax": i,
      "aria-label": c,
      className: x("ef-segprogress", o),
      children: [
        /* @__PURE__ */ a("div", { className: "ef-segprogress__track", children: Array.from({ length: i }, (f, d) => /* @__PURE__ */ a(
          "div",
          {
            "data-filled": d < s || void 0,
            "data-active": d === s - 1 || void 0,
            className: x(
              "ef-segprogress__segment",
              d < s && "ef-segprogress__segment--filled",
              d === s && s < i && "ef-segprogress__segment--next"
            )
          },
          d
        )) }),
        r && /* @__PURE__ */ a("span", { className: "ef-segprogress__label", "aria-hidden": !0, children: c })
      ]
    }
  );
}
const Vc = {
  completed: "check",
  current: "radio_button_checked",
  upcoming: "radio_button_unchecked",
  error: "close"
};
function cu({
  title: e,
  description: t,
  timestamp: n,
  status: r = "upcoming",
  icon: o,
  nodeContent: i,
  className: s,
  children: l
}) {
  return /* @__PURE__ */ b(
    "li",
    {
      "data-status": r,
      className: x("ef-timeline-item", `ef-timeline-item--${r}`, s),
      children: [
        /* @__PURE__ */ b("div", { className: "ef-timeline-item__node-col", "aria-hidden": !0, children: [
          /* @__PURE__ */ a("div", { className: "ef-timeline-item__node", children: i ?? /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-timeline-item__node-icon", children: o ?? Vc[r] }) }),
          /* @__PURE__ */ a("div", { className: "ef-timeline-item__connector" })
        ] }),
        /* @__PURE__ */ b("div", { className: "ef-timeline-item__content", children: [
          /* @__PURE__ */ b("div", { className: "ef-timeline-item__header", children: [
            /* @__PURE__ */ a("span", { className: "ef-timeline-item__title", children: e }),
            n && /* @__PURE__ */ a("span", { className: "ef-timeline-item__timestamp", children: n })
          ] }),
          t && /* @__PURE__ */ a("p", { className: "ef-timeline-item__description", children: t }),
          l && /* @__PURE__ */ a("div", { className: "ef-timeline-item__body", children: l })
        ] })
      ]
    }
  );
}
function du({ children: e, className: t, label: n = "Activity timeline" }) {
  return /* @__PURE__ */ a(
    "ol",
    {
      "aria-label": n,
      className: x("ef-timeline", t),
      children: e
    }
  );
}
const Bc = {
  pdf: "picture_as_pdf",
  doc: "description",
  docx: "description",
  xls: "table_chart",
  xlsx: "table_chart",
  csv: "table_chart",
  ppt: "slideshow",
  pptx: "slideshow",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  svg: "image",
  mp4: "videocam",
  mp3: "audio_file",
  zip: "folder_zip",
  txt: "text_snippet"
};
function $c(e) {
  const t = e.split(".").pop()?.toLowerCase() ?? "";
  return Bc[t] ?? "insert_drive_file";
}
function uu({
  name: e,
  size: t,
  status: n = "uploading",
  progress: r,
  errorMessage: o,
  onRemove: i,
  className: s
}) {
  return /* @__PURE__ */ b(
    "div",
    {
      "data-status": n,
      className: x("ef-uploader-file", `ef-uploader-file--${n}`, s),
      children: [
        /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-uploader-file__icon", "aria-hidden": !0, children: $c(e) }),
        /* @__PURE__ */ b("div", { className: "ef-uploader-file__info", children: [
          /* @__PURE__ */ b("div", { className: "ef-uploader-file__name-row", children: [
            /* @__PURE__ */ a("span", { className: "ef-uploader-file__name", children: e }),
            t && n !== "uploading" && /* @__PURE__ */ a("span", { className: "ef-uploader-file__size", children: t }),
            n === "uploading" && r != null && /* @__PURE__ */ b("span", { className: "ef-uploader-file__size", children: [
              Math.round(r),
              "%"
            ] })
          ] }),
          n === "uploading" && r != null && /* @__PURE__ */ a("div", { className: "ef-uploader-file__progress-track", role: "progressbar", "aria-valuenow": r, "aria-valuemin": 0, "aria-valuemax": 100, children: /* @__PURE__ */ a(
            "div",
            {
              className: "ef-uploader-file__progress-fill",
              style: { width: `${Math.min(100, r)}%` }
            }
          ) }),
          n === "error" && o && /* @__PURE__ */ a("span", { className: "ef-uploader-file__error", children: o })
        ] }),
        n === "success" && /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-uploader-file__status-icon", "aria-hidden": !0, children: "check_circle" }),
        n === "error" && /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-uploader-file__status-icon ef-uploader-file__status-icon--error", "aria-hidden": !0, children: "error" }),
        i && /* @__PURE__ */ a(
          "button",
          {
            type: "button",
            className: "ef-uploader-file__remove",
            onClick: i,
            "aria-label": `Remove ${e}`,
            children: /* @__PURE__ */ a("span", { className: "material-symbols-outlined", "aria-hidden": !0, children: "close" })
          }
        )
      ]
    }
  );
}
function fu({
  onFiles: e,
  accept: t,
  multiple: n = !1,
  disabled: r = !1,
  dragLabel: o = "Drag and drop files here",
  browseLabel: i = "Browse files",
  hint: s,
  children: l,
  className: c
}) {
  const f = u.useRef(null), [d, p] = u.useState(!1);
  function m(y) {
    y.preventDefault(), r || p(!0);
  }
  function g() {
    p(!1);
  }
  function v(y) {
    y.preventDefault(), p(!1), !r && y.dataTransfer.files.length && e?.(y.dataTransfer.files);
  }
  function h(y) {
    y.target.files?.length && (e?.(y.target.files), y.target.value = "");
  }
  return /* @__PURE__ */ b("div", { className: x("ef-uploader", c), children: [
    /* @__PURE__ */ b(
      "div",
      {
        role: "button",
        "aria-disabled": r,
        tabIndex: r ? -1 : 0,
        "data-dragging": d || void 0,
        "data-disabled": r || void 0,
        className: x(
          "ef-uploader__zone",
          d && "ef-uploader__zone--dragging",
          r && "ef-uploader__zone--disabled"
        ),
        onDragOver: m,
        onDragLeave: g,
        onDrop: v,
        onClick: () => !r && f.current?.click(),
        onKeyDown: (y) => {
          (y.key === "Enter" || y.key === " ") && !r && (y.preventDefault(), f.current?.click());
        },
        children: [
          /* @__PURE__ */ a("span", { className: "material-symbols-outlined ef-uploader__icon", "aria-hidden": !0, children: "cloud_upload" }),
          /* @__PURE__ */ b("div", { className: "ef-uploader__labels", children: [
            /* @__PURE__ */ a("span", { className: "ef-uploader__drag-label", children: o }),
            /* @__PURE__ */ a("span", { className: "ef-uploader__or", children: "or" }),
            /* @__PURE__ */ a("span", { className: "ef-uploader__browse-label", children: i })
          ] }),
          s && /* @__PURE__ */ a("span", { className: "ef-uploader__hint", children: s })
        ]
      }
    ),
    /* @__PURE__ */ a(
      "input",
      {
        ref: f,
        type: "file",
        accept: t,
        multiple: n,
        disabled: r,
        className: "ef-uploader__input",
        onChange: h,
        tabIndex: -1,
        "aria-hidden": !0
      }
    ),
    l && /* @__PURE__ */ a("div", { className: "ef-uploader__file-list", children: l })
  ] });
}
function pu({
  icon: e,
  label: t,
  variant: n = "primary",
  size: r = "default",
  onClick: o,
  disabled: i = !1,
  "aria-label": s,
  className: l,
  type: c = "button"
}) {
  const f = !!t;
  return /* @__PURE__ */ b(
    "button",
    {
      type: c,
      disabled: i,
      onClick: o,
      "aria-label": t ? void 0 : s ?? "Action",
      "data-variant": n,
      "data-size": r,
      "data-extended": f || void 0,
      className: x(
        "ef-fab",
        `ef-fab--${n}`,
        r === "small" && "ef-fab--small",
        f && "ef-fab--extended",
        l
      ),
      children: [
        /* @__PURE__ */ a("span", { className: "ef-fab__icon", "aria-hidden": !0, children: e }),
        t && /* @__PURE__ */ a("span", { className: "ef-fab__label", children: t })
      ]
    }
  );
}
export {
  $d as AI_AGENT_LOGO_PATH,
  qc as Badge,
  Qc as Breadcrumb,
  ad as BreadcrumbEllipsis,
  ed as BreadcrumbItem,
  td as BreadcrumbLink,
  Jc as BreadcrumbList,
  nd as BreadcrumbPage,
  rd as BreadcrumbSeparator,
  Wa as Button,
  Yc as ButtonDropdown,
  Yd as CAREER_HUB_CHRO_TABS,
  Xd as CAREER_HUB_HRBP_TABS,
  Ui as COPILOT_LOGO_PATH,
  gu as CORNER_RADIUS_TOKENS,
  eu as CareerHubShell,
  iu as Chip,
  od as CourseObjectCard,
  hd as DataTable,
  vd as DataTableBody,
  Cd as DataTableCell,
  yd as DataTableHead,
  gd as DataTableHeader,
  bd as DataTableRow,
  su as DateTimePicker,
  Md as Dialog,
  Od as DialogBody,
  Ad as DialogClose,
  Fd as DialogContent,
  Vd as DialogDescription,
  Dd as DialogFooter,
  Pd as DialogHeader,
  Ei as DialogOverlay,
  Li as DialogPortal,
  Td as DialogStepper,
  Id as DialogTitle,
  Rd as DialogTrigger,
  st as DropdownMenu,
  Ga as DropdownMenuContent,
  Ya as DropdownMenuItem,
  Ka as DropdownMenuPortal,
  Xa as DropdownMenuSeparator,
  Ua as DropdownMenuTrigger,
  Bd as EIGHTFOLD_LOGO_PATH,
  zd as EMPLOYEE_AVATAR_MENU_ITEMS,
  Kd as EMPLOYEE_NON_MANAGER_TABS,
  is as EmptyIllustration,
  pu as FloatingActionButton,
  Mr as Header,
  Di as HeaderActions,
  Ii as HeaderGroup,
  Pr as HeaderSecondary,
  Fr as HeaderTextGroup,
  Ar as HeaderTitle,
  Rr as HeaderToolbar,
  tu as InfoBar,
  qa as Input,
  fo as InsightCard,
  Gd as MANAGER_TABS,
  Jt as MARKETPLACE_SUBITEMS,
  Qt as MY_ACTIVITY_SUBITEMS,
  Ud as MY_CAREER_SUBITEMS,
  ld as MentorInsightCard,
  nu as MessageBar,
  Fi as Navbar,
  ci as NavigationMenu,
  dd as NavigationMenuContent,
  lt as NavigationMenuItem,
  dt as NavigationMenuLink,
  di as NavigationMenuList,
  cd as NavigationMenuTrigger,
  ui as NavigationMenuViewport,
  ki as NumberBadge,
  qn as OpenTo,
  Zd as PRIMARY_NAVBAR_PRODUCT_IDS,
  Ki as PRODUCT_NAMES,
  ou as Panel,
  sd as PeopleObjectCard,
  Vt as Pill,
  Tr as ProductBackground,
  Ci as Progress,
  id as ProjectObjectCard,
  vu as SPACING_TOKENS,
  lu as SegmentedProgress,
  _d as Select,
  Ld as SelectContent,
  wd as SelectGroup,
  kd as SelectItem,
  Ed as SelectLabel,
  vi as SelectScrollDownButton,
  gi as SelectScrollUpButton,
  Sd as SelectSeparator,
  Nd as SelectTrigger,
  xd as SelectValue,
  eo as SkillTag,
  ru as Snackbar,
  au as SnackbarContainer,
  Mi as StatCard,
  Ri as StatCardGroup,
  xr as Stepper,
  Ni as StepperDescription,
  Er as StepperIndicator,
  Lr as StepperItem,
  Nr as StepperList,
  qt as StepperSeparator,
  kr as StepperTitle,
  xi as StepperTrigger,
  Jd as TALENT_ACQUISITION_ACTION_BUTTONS,
  qd as TALENT_ACQUISITION_RECRUITER_TABS,
  Qd as TALENT_ACQUISITION_SEARCH_PLACEHOLDER,
  ud as Tabs,
  md as TabsContent,
  fd as TabsList,
  pd as TabsTrigger,
  to as Tag,
  Xc as TagGroup,
  du as Timeline,
  cu as TimelineItem,
  fu as Uploader,
  uu as UploaderFileItem,
  ao as badgeVariants,
  ja as buttonVariants,
  jd as getNavbarProductConfig,
  Hd as getProductLogoPath,
  Wd as productLogos,
  fi as tabsListVariants
};
