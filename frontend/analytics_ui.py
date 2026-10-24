import os
import streamlit as st
from datetime import datetime
import requests
import pandas as pd
import altair as alt

API_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")


def analytics_tab():
    st.title("Expense Analytics")

    # Date inputs
    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Start Date", datetime(2024, 8, 1))
    with col2:
        end_date = st.date_input("End Date", datetime(2024, 8, 5))

    if st.button("Get Analytics"):
        payload = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d")
        }

        try:
            res = requests.post(f"{API_URL}/analytics/", json=payload, timeout=10)
            if res.status_code != 200:
                st.error(f"Backend returned error: {res.status_code}")
                return
            response = res.json()
        except Exception as e:
            st.error(f"Failed to connect to backend at {API_URL}: {e}")
            return

        if not response:
            st.info("No expense data found for the selected date range.")
            return

        # Prepare DataFrame
        data = {
            "Category": list(response.keys()),
            "Total": [response[cat]["total"] for cat in response],
            "Percentage": [response[cat]["percentage"] for cat in response]
        }

        df = pd.DataFrame(data)
        df_sorted = df.sort_values(by="Percentage", ascending=False)

        # Quick stats
        total_expense = df_sorted["Total"].sum()
        max_expense = df_sorted["Total"].max()
        avg_expense = df_sorted["Total"].mean()

        stat_col1, stat_col2, stat_col3 = st.columns(3)
        stat_col1.metric("Total Expense", f"₹{total_expense:.2f}")
        stat_col2.metric("Max Expense", f"₹{max_expense:.2f}")
        stat_col3.metric("Average Expense", f"₹{avg_expense:.2f}")

        # Altair bar chart
        chart = alt.Chart(df_sorted).mark_bar().encode(
            x=alt.X('Category', sort='-y'),
            y='Percentage',
            color=alt.Color('Category', legend=None)
        ).properties(height=300)

        st.subheader("Expense Breakdown by Category")
        st.altair_chart(chart, use_container_width=True)

        # Scrollable dataframe
        df_display = df_sorted.copy()
        df_display["Total"] = df_display["Total"].map("{:.2f}".format)
        df_display["Percentage"] = df_display["Percentage"].map("{:.2f}%".format)
        st.subheader("Detailed Table")
        st.dataframe(df_display, use_container_width=True)
